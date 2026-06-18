"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode, type TouchEvent } from "react";
import { X, type LucideIcon } from "lucide-react";

export interface SidebarTabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

interface TabbedSidebarLayoutProps {
  tabs: SidebarTabDef[];
}

const SWIPE_CLOSE_THRESHOLD = 70; // px, neechay swipe karne par overlay close
const ANIMATION_MS = 280;
const SHEET_TRANSITION = "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)";
const BACKDROP_TRANSITION = "opacity 280ms ease";

export function TabbedSidebarLayout({ tabs }: TabbedSidebarLayoutProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false); // mounted ya nahi
  const [isVisible, setIsVisible] = useState(false);   // slid-up (open) vs slid-down (closed) position
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // Mount hone ke baad next frame me slide-up trigger karo (entrance animation)
  useEffect(() => {
    if (!mobileOpen) return;
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [mobileOpen]);

  const openOverlay = useCallback((id: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveTabId(id);
    setDragY(0);
    setIsVisible(false);
    setMobileOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsVisible(false); // slide-down transition shuru
    closeTimeoutRef.current = setTimeout(() => {
      setMobileOpen(false);
      setDragY(0);
    }, ANIMATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleDesktopTabClick = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const handleMobileTabClick = useCallback(
    (id: string) => {
      if (mobileOpen && id === activeTabId) {
        closeOverlay(); // active icon retap -> smooth close
        return;
      }
      openOverlay(id);
    },
    [mobileOpen, activeTabId, openOverlay, closeOverlay]
  );

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    setDragY(Math.max(0, delta)); // sirf neechay ki taraf drag allow
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (dragY > SWIPE_CLOSE_THRESHOLD) {
      closeOverlay();
    } else {
      setDragY(0); // transition on ho ke smoothly snap-back hoga
    }
    touchStartY.current = null;
  }, [dragY, closeOverlay]);

  // Drag ke dauraan finger ko 1:1 follow karo (no transition), warna eased transition
  const sheetTransform = isDragging
    ? `translateY(${dragY}px)`
    : isVisible
    ? "translateY(0)"
    : "translateY(100%)";

  return (
    <>
      {/* Desktop: inline tabs, normal flow */}
      <aside className="hidden md:flex md:w-80 md:shrink-0 md:flex-col md:border-r md:border-border bg-white">
        <div className="flex border-b border-border px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => handleDesktopTabClick(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-3">{activeTab?.content}</div>
      </aside>

      {/* Mobile/Tablet: bottom icon bar — fixed = viewport-pinned, scroll jank-proof */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-border bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = mobileOpen && tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => handleMobileTabClick(tab.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile/Tablet: fullscreen overlay, blurred backdrop, drag-to-dismiss */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 flex flex-col bg-black/20 backdrop-blur-sm"
          style={{ opacity: isVisible ? 1 : 0, transition: BACKDROP_TRANSITION }}
          onClick={closeOverlay}
        >
          <div
            className="mt-6 mb-16 flex flex-1 flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl"
            style={{ transform: sheetTransform, transition: isDragging ? "none" : SHEET_TRANSITION }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-2 pt-2"
              style={{ touchAction: "none" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="mb-2 h-1 w-10 rounded-full bg-border" />
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold">{activeTab?.label}</span>
                <button onClick={closeOverlay} className="text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{activeTab?.content}</div>
          </div>
        </div>
      )}
    </>
  );
}