"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type TouchEvent,
} from "react";
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
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const ANIMATION_MS = 320;
const SHEET_TRANSITION =
  "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const BACKDROP_TRANSITION = "opacity 320ms ease";

export function TabbedSidebarLayout({ tabs }: TabbedSidebarLayoutProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
const scrollableRef = useRef<HTMLDivElement>(null);

  const dragY = useRef(0);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  const raf = useRef<number | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const activeTab =
    tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // OPEN animation
  const openOverlay = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);

    setActiveTabId(id);
    setMobileOpen(true);
    setIsVisible(false);

    dragY.current = 0;

    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // CLOSE animation
  const closeOverlay = useCallback(() => {
    setIsVisible(false);

    if (sheetRef.current) {
      sheetRef.current.style.transform = "translateY(100%)";
    }

    closeTimer.current = setTimeout(() => {
      setMobileOpen(false);
      dragY.current = 0;
    }, ANIMATION_MS);
  }, []);

  // LOCK BODY SCROLL
  useEffect(() => {
    if (!mobileOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // TOUCH START
const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
  const scrollEl = scrollableRef.current;

  const isAtTop = !scrollEl || scrollEl.scrollTop <= 0;

  if (!isAtTop) {
    startY.current = null;
    return;
  }

  startY.current = e.touches[0].clientY;
  startTime.current = Date.now();
}, []);

  // TOUCH MOVE (NO RE-RENDER = NO LAG)
const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
  if (startY.current === null) return;

  const delta = e.touches[0].clientY - startY.current;

  if (delta <= 0) return;

  e.preventDefault();

  dragY.current = delta;

  if (raf.current) return;

  raf.current = requestAnimationFrame(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${dragY.current}px)`;
    }
    const screenHeight = window.innerHeight;
    const maxDrag = screenHeight * 0.9;
    const progress = Math.min(dragY.current / maxDrag, 1);
    const fadeStart = 0.7;

    let opacity = 1;
    if (progress <= fadeStart) {
      opacity = 1;
    } else {
      const t = (progress - fadeStart) / (1 - fadeStart);
      opacity = 1 - Math.pow(t, 2.5);
    }

    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(opacity);
    }

    raf.current = null;
  });
}, []);

useEffect(() => {
  const sheet = sheetRef.current;
  if (!sheet || !mobileOpen) return;

  sheet.addEventListener("touchmove", handleTouchMove, { passive: false });

  return () => {
    sheet.removeEventListener("touchmove", handleTouchMove);
  };
}, [mobileOpen, handleTouchMove]);

  // TOUCH END
  const handleTouchEnd = useCallback(() => {
    const elapsed = Date.now() - (startTime.current ?? Date.now());
    const velocity = dragY.current / elapsed;

    const shouldClose =
      dragY.current > SWIPE_CLOSE_THRESHOLD ||
      velocity > SWIPE_VELOCITY_THRESHOLD;

    if (shouldClose) {
      closeOverlay();
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transition = SHEET_TRANSITION;
        sheetRef.current.style.transform = "translateY(0)";
      }
    }

    dragY.current = 0;
    startY.current = null;
    startTime.current = null;
  }, [closeOverlay]);


const handleTabClick = (tabId: string) => {
  if (mobileOpen) {
    if (activeTabId === tabId) {
      closeOverlay();
    } else {
      setActiveTabId(tabId);
    }
  } else {
    openOverlay(tabId);
  }
};


  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-80 md:flex-col border-r bg-white">
        <div className="flex border-b px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTabId;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex flex-1 flex-col items-center py-3 text-xs ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-3 overflow-y-auto">
          {activeTab?.content}
        </div>
      </aside>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t flex z-30">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
onClick={() => handleTabClick(tab.id)}
              className="flex flex-1 flex-col items-center justify-center text-xs text-gray-600"
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* MOBILE SHEET */}
      {mobileOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-20 bg-black/40 flex flex-col"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: BACKDROP_TRANSITION,
          }}
          onClick={closeOverlay}
        >
     <div
  ref={sheetRef}
  className="mt-6 mb-16 flex flex-col flex-1 bg-white rounded-t-2xl overflow-hidden"
  style={{
    transform: isVisible ? "translateY(0)" : "translateY(100%)",
    transition: SHEET_TRANSITION,
  }}
  onClick={(e) => e.stopPropagation()}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
            {/* HANDLE */}
            <div
              className="p-3 border-b flex flex-col items-center"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
              <div className="flex w-full justify-between">
                <span className="font-semibold">
                  {activeTab?.label}
                </span>
                <button onClick={closeOverlay}>
                  <X />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab?.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}