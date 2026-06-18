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

const SWIPE_CLOSE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 0.5; // px/ms — fast flick se bhi close ho
const ANIMATION_MS = 320;
const SHEET_TRANSITION = "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const BACKDROP_TRANSITION = "opacity 320ms ease";

export function TabbedSidebarLayout({ tabs }: TabbedSidebarLayoutProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null); // velocity ke liye
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

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
    setIsVisible(false);
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
        closeOverlay();
        return;
      }
      openOverlay(id);
    },
    [mobileOpen, activeTabId, openOverlay, closeOverlay]
  );

  // Poori sheet pe touch — lekin scroll content ko block mat karo
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const scrollEl = scrollableRef.current;
    // Agar scrollable area top pe hai tabhi drag allow karo
    if (scrollEl && scrollEl.scrollTop > 0) return;

    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsDragging(false); // abhi decide nahi, wait karo
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;

    if (delta <= 0) {
      // Upar swipe = normal scroll, drag cancel
      touchStartY.current = null;
      setIsDragging(false);
      setDragY(0);
      return;
    }

    // Sirf neechay drag allow, scroll block
    e.preventDefault();
    setIsDragging(true);
    // Resistance effect — jitna zyada drag utna slow
    const resistance = 1 - Math.min(delta / 800, 0.4);
    setDragY(delta * resistance);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) {
      touchStartY.current = null;
      return;
    }

    setIsDragging(false);

    // Velocity calculate karo
    const elapsed = Date.now() - (touchStartTime.current ?? Date.now());
    const velocity = dragY / elapsed;

    if (dragY > SWIPE_CLOSE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      closeOverlay();
    } else {
      setDragY(0); // snap back
    }

    touchStartY.current = null;
    touchStartTime.current = null;
  }, [isDragging, dragY, closeOverlay]);

  // Drag ke saath backdrop bhi fade — YouTube jaisi feel
  const backdropOpacity = isDragging
    ? Math.max(0, 1 - dragY / 400)
    : isVisible
    ? 1
    : 0;

  const sheetTransform = isDragging
    ? `translateY(${dragY}px)`
    : isVisible
    ? "translateY(0)"
    : "translateY(100%)";

  return (
    <>
      {/* Desktop: inline sidebar */}
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

      {/* Mobile: bottom nav bar */}
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

      {/* Mobile: bottom sheet overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 flex flex-col bg-black/20 backdrop-blur-sm"
          style={{
            opacity: backdropOpacity,
            transition: isDragging ? "none" : BACKDROP_TRANSITION,
          }}
          onClick={closeOverlay}
        >
          <div
            ref={sheetRef}
            className="mt-6 mb-16 flex flex-1 flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl"
            style={{
              transform: sheetTransform,
              transition: isDragging ? "none" : SHEET_TRANSITION,
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag handle + header */}
            <div className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-2 pt-2">
              <div className="mb-2 h-1 w-10 rounded-full bg-border" />
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold">{activeTab?.label}</span>
                <button onClick={closeOverlay} className="text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div ref={scrollableRef} className="flex-1 overflow-y-auto p-3">
              {activeTab?.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}