"use client";

import { useEffect, useRef, useState } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);

  const startY = useRef(0);
  const currentY = useRef(0);
  const startTime = useRef(0);
  const dragMode = useRef(false); // true once this touch is confirmed as a close-drag
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

  const snapBack = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = ANIMATION;
      sheetRef.current.style.transform = "translateY(0)";
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = ANIMATION;
      backdropRef.current.style.opacity = "1";
    }
  };

  useEffect(() => {
    const sheet = sheetRef.current;
    const content = contentRef.current;
    if (!sheet || !content) return;

    const onTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
      startTime.current = Date.now();
      currentY.current = 0;
      dragMode.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
  const y = e.touches[0].clientY;
  const rawDelta = y - startY.current;

  if (!dragMode.current) {
    if (rawDelta > 0 && content.scrollTop <= 0) {
      dragMode.current = true;
      startY.current = y;
      // 👇 drag start hote hi transition kill karo, taake 1:1 follow ho
      sheet.style.transition = "none";
      if (backdropRef.current) backdropRef.current.style.transition = "none";
    } else {
      return;
    }
  }

      let delta = y - startY.current;
      if (delta < 0) delta = 0;
      currentY.current = delta;

      e.preventDefault(); // stop scroll/bounce only once we're actually dragging

      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        const height = window.innerHeight;
        const progress = Math.min(delta / height, 1);
        const eased = progress * progress;

        sheet.style.transform = `translateY(${delta}px)`;
        if (backdropRef.current) {
          backdropRef.current.style.opacity = String(1 - eased);
        }
        raf.current = null;
      });
    };

    const onTouchEnd = () => {
  // 👇 stale rAF cancel karo close/snapBack se pehle
  if (raf.current) {
    cancelAnimationFrame(raf.current);
    raf.current = null;
  }

  if (!dragMode.current) return;

  const time = Date.now() - startTime.current;
  const velocity = currentY.current / Math.max(time, 1);
  const height = window.innerHeight;
  const progress = currentY.current / height;

  if (progress > CLOSE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
    close();
  } else {
    snapBack();
  }

  dragMode.current = false;
  currentY.current = 0;
};

    sheet.addEventListener("touchstart", onTouchStart, { passive: true });
    sheet.addEventListener("touchmove", onTouchMove, { passive: false });
    sheet.addEventListener("touchend", onTouchEnd, { passive: true });
    sheet.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      sheet.removeEventListener("touchstart", onTouchStart);
      sheet.removeEventListener("touchmove", onTouchMove);
      sheet.removeEventListener("touchend", onTouchEnd);
      sheet.removeEventListener("touchcancel", onTouchEnd);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [close]);

  return (
    <>
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

      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl bg-primary-foreground shadow-2xl overflow-hidden"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: ANIMATION,
          willChange: "transform",
          pointerEvents: "auto",
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-12 rounded-full bg-border" />
        </div>

        <div ref={contentRef} className="overflow-y-auto max-h-[85vh]">
          <div className="relative aspect-[3/2] w-full">
            <Image
              src={template.imageUrl}
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
              <Button onClick={onUse}>Use Template</Button>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}