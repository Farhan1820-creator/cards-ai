"use client";

import { useState, useRef, useCallback, type ReactNode, type TouchEvent } from "react";
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

const SWIPE_CLOSE_THRESHOLD = 70; // px, neechay swipe karne par overlay band

export function TabbedSidebarLayout({ tabs }: TabbedSidebarLayoutProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const touchDeltaY = useRef(0);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  const handleDesktopTabClick = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const handleMobileTabClick = useCallback(
    (id: string) => {
      // Active tab dobara tap -> overlay close
      if (mobileOpen && id === activeTabId) {
        setMobileOpen(false);
        return;
      }
      setActiveTabId(id);
      setMobileOpen(true);
    },
    [mobileOpen, activeTabId]
  );

  const closeMobileOverlay = useCallback(() => setMobileOpen(false), []);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchDeltaY.current > SWIPE_CLOSE_THRESHOLD) closeMobileOverlay();
    touchStartY.current = null;
    touchDeltaY.current = 0;
  }, [closeMobileOverlay]);

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

      {/* Mobile/Tablet: bottom icon bar — needs a `relative` ancestor (parent provides this) */}
      <nav className="md:hidden absolute inset-x-0 bottom-0 z-30 flex h-16 border-t border-border bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
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

      {/* Mobile/Tablet: fullscreen overlay, blurred backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden absolute inset-0 z-20 flex flex-col bg-black/20 backdrop-blur-sm"
          onClick={closeMobileOverlay}
        >
          <div
            className="mt-6 mb-16 flex flex-1 flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-2 pt-2"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="mb-2 h-1 w-10 rounded-full bg-border" />
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold">{activeTab?.label}</span>
                <button onClick={closeMobileOverlay} className="text-muted-foreground">
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