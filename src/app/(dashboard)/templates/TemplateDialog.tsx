// components/templates/TemplateDialog.tsx
"use client";

import { useState, useRef, useCallback, useEffect, type TouchEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Template } from "@/types/template";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TemplateDialogProps {
  template: Template | null;
  onClose: () => void;
}

const SWIPE_CLOSE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const ANIMATION_MS = 320;
const SHEET_TRANSITION = "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const BACKDROP_TRANSITION = "opacity 320ms ease";

// ─── Mobile Sheet ────────────────────────────────────────────────────────────
function MobileSheet({
  template,
  onClose,
  onUseTemplate,
}: {
  template: Template;
  onClose: () => void;
  onUseTemplate: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Entrance animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const triggerClose = useCallback(() => {
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, ANIMATION_MS);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const scrollEl = scrollableRef.current;
    if (scrollEl && scrollEl.scrollTop > 0) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;

    if (delta <= 0) {
      touchStartY.current = null;
      setIsDragging(false);
      setDragY(0);
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    const resistance = 1 - Math.min(delta / 800, 0.4);
    setDragY(delta * resistance);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) {
      touchStartY.current = null;
      return;
    }

    setIsDragging(false);
    const elapsed = Date.now() - (touchStartTime.current ?? Date.now());
    const velocity = dragY / elapsed;

    if (dragY > SWIPE_CLOSE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      triggerClose();
    } else {
      setDragY(0);
    }

    touchStartY.current = null;
    touchStartTime.current = null;
  }, [isDragging, dragY, triggerClose]);

  const backdropOpacity = isDragging
    ? Math.max(0, 1 - dragY / 400)
    : isVisible ? 1 : 0;

  const sheetTransform = isDragging
    ? `translateY(${dragY}px)`
    : isVisible ? "translateY(0)" : "translateY(100%)";

  return (
  <>
    {/* Backdrop — alag element, sheet ko affect nahi karega */}
    <div
      className="fixed inset-0 z-50 bg-black/50"
      style={{
        opacity: isDragging ? Math.max(0, 1 - dragY / 400) : isVisible ? 1 : 0,
        transition: isDragging ? "none" : BACKDROP_TRANSITION,
      }}
      onClick={triggerClose}
    />

    {/* Sheet — apna z-index, opacity fixed at 1 */}
    <div
      className="fixed inset-x-0 bottom-0 z-[51] flex flex-col overflow-hidden rounded-t-2xl bg-primary-foreground shadow-xl"
      style={{
        transform: sheetTransform,
        transition: isDragging ? "none" : SHEET_TRANSITION,
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="h-1 w-10 rounded-full bg-border" />
      </div>

      {/* Scrollable content */}
      <div ref={scrollableRef} className="overflow-y-auto">
        {/* Image */}
        <div className="relative w-full aspect-[3/2]">
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 p-5">
          <div className="space-y-2">
            <Badge variant="secondary" className="capitalize">
              {template.category}
            </Badge>
            <h2 className="text-xl font-semibold leading-tight">
              {template.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Use this template as a starting point. You can customize the
              text, colors, and images on the next step.
            </p>
          </div>

          <div className="flex flex-col gap-2 pb-2">
            <Button
              onClick={onUseTemplate}
              className="w-full active:scale-[0.98] transition-transform duration-150"
            >
              Use Template
            </Button>
            <Button
              variant="ghost"
              className="w-full active:scale-[0.98] transition-transform duration-150"
              onClick={triggerClose}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function TemplateDialog({ template, onClose }: TemplateDialogProps) {
  const router = useRouter();

  const handleUseTemplate = () => {
    if (!template) return;
    const params = new URLSearchParams({
      templateId: template.id,
      cardType: template.category,
    });
    router.push(`/generate?${params}`);
    onClose();
  };

  return (
    <>
      {/* ── Desktop: Radix Dialog (sm aur upar) ── */}
      <Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="hidden sm:flex max-w-2xl p-0 overflow-hidden gap-0 bg-primary-foreground">
          <DialogTitle className="sr-only">
            {template?.name ?? "Template Preview"}
          </DialogTitle>

          {template && (
            <div className="flex flex-row w-full">
              <div className="relative w-64 shrink-0 aspect-[3/4]">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  fill
                  className="object-cover"
                  sizes="256px"
                  priority
                />
              </div>

              <div className="flex flex-col justify-between gap-6 p-6 flex-1 min-h-0">
                <div className="space-y-3">
                  <Badge variant="secondary" className="capitalize">
                    {template.category}
                  </Badge>
                  <h2 className="text-xl font-semibold leading-tight">
                    {template.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Use this template as a starting point. You can customize
                    the text, colors, and images on the next step.
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    onClick={handleUseTemplate}
                    className="w-full transition-all duration-200 active:scale-[0.98]"
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full transition-all duration-200 active:scale-[0.98]"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Mobile: Custom swipeable bottom sheet ── */}
      {template && (
        <div className="sm:hidden">
          <MobileSheet
            template={template}
            onClose={onClose}
            onUseTemplate={handleUseTemplate}
          />
        </div>
      )}
    </>
  );
}