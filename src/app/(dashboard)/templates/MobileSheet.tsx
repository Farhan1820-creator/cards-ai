"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Template } from "@/types/template";

const CLOSE_THRESHOLD = 0.85;
const VELOCITY_THRESHOLD = 0.6;
const ANIMATION = "420ms cubic-bezier(0.2, 0.9, 0.2, 1)";

interface Props {
  template: Template;
  onClose: () => void;
  onUse: () => void;
}

export default function MobileSheet({ template, onClose, onUse }: Props) {
  const [open, setOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const startY = useRef(0);
  const currentY = useRef(0);
  const startTime = useRef(0);

  const isDragging = useRef(false);
  const didDrag = useRef(false);

  const raf = useRef<number | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
  }, []);

  const close = () => {
    setOpen(false);

    if (sheetRef.current) {
      sheetRef.current.style.transition = ANIMATION;
      sheetRef.current.style.transform = "translateY(100%)";
    }

    if (backdropRef.current) {
      backdropRef.current.style.transition = ANIMATION;
      backdropRef.current.style.opacity = "0";
    }

    setTimeout(onClose, 420);
  };

  const onStart = (e: TouchEvent) => {
    isDragging.current = true;
    didDrag.current = false;

    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
  };

  const onMove = (e: TouchEvent) => {
    if (!isDragging.current) return;

    const y = e.touches[0].clientY;
    let delta = y - startY.current;

    if (delta < 0) delta = 0;

    if (delta > 8) didDrag.current = true;

    currentY.current = delta;

    e.preventDefault();

    if (raf.current) return;

    raf.current = requestAnimationFrame(() => {
      const height = window.innerHeight;

      const progress = Math.min(delta / height, 1);
      const eased = progress * progress;

      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${delta}px)`;
      }

      if (backdropRef.current) {
        backdropRef.current.style.opacity = String(1 - eased);
      }

      raf.current = null;
    });
  };

  const snapOrClose = (progress: number, velocity: number) => {
    if (progress > CLOSE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      close();
      return;
    }

    // snap back
    if (sheetRef.current) {
      sheetRef.current.style.transition = ANIMATION;
      sheetRef.current.style.transform = "translateY(0)";
    }

    if (backdropRef.current) {
      backdropRef.current.style.transition = ANIMATION;
      backdropRef.current.style.opacity = "1";
    }
  };

  const onEnd = () => {
    isDragging.current = false;

    const time = Date.now() - startTime.current;
    const velocity = currentY.current / Math.max(time, 1);
    const height = window.innerHeight;

    const progress = currentY.current / height;

    snapOrClose(progress, velocity);

    currentY.current = 0;

    setTimeout(() => {
      didDrag.current = false;
    }, 50);
  };

  return (
    <>
      {/* BACKDROP (FIXED CLICK BLOCKING) */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/50"
        style={{
          opacity: open ? 1 : 0,
          transition: ANIMATION,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={close}
      />

      {/* SHEET (ALWAYS ABOVE EVERYTHING) */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl bg-primary-foreground shadow-2xl overflow-hidden"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: ANIMATION,
          willChange: "transform",
          pointerEvents: "auto",
        }}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      >
        {/* HANDLE */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-12 rounded-full bg-border" />
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto max-h-[85vh]">
          <div className="relative aspect-[3/2] w-full">
            <Image
              src={template.thumbnail}
              alt={template.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          <div className="p-5 flex flex-col gap-4">
            <Badge variant="secondary" className="capitalize">
              {template.category}
            </Badge>

            <h2 className="text-xl font-semibold">{template.name}</h2>

            <p className="text-sm text-muted-foreground">
              Use this template as a starting point.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (didDrag.current) return;
                  onUse();
                }}
              >
                Use Template
              </Button>

              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}