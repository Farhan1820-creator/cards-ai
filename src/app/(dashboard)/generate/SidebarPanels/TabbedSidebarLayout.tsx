"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
  type ReactNode,
  type TouchEvent,
} from "react";
import { X, ChevronLeft, ChevronRight, Check, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SidebarTabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

interface TabbedSidebarLayoutProps {
  tabs: SidebarTabDef[];
  progress?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SWIPE_CLOSE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const ANIMATION_MS = 320;
const SHEET_TRANSITION = "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const BACKDROP_TRANSITION = "opacity 320ms ease";

// ── TabSteps ──────────────────────────────────────────────────────────────────

const TabSteps = memo(function TabSteps({
  tabs,
  activeIndex,
  onTabClick,
  compact,
}: {
  tabs: SidebarTabDef[];
  activeIndex: number;
  onTabClick: (id: string) => void;
  compact: boolean;
}) {
  const btnSz = compact ? "w-6 h-6" : "w-8 h-8";
  const iconSz = compact ? "w-3 h-3" : "w-3.5 h-3.5";
  const px = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <div className={`flex items-center flex-1 min-w-0 ${px}`}>
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;

        return (
          <div key={tab.id} className="flex items-center gap-2 min-w-0">
            <button onClick={() => onTabClick(tab.id)} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`${btnSz} rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                isDone ? "bg-emerald-500 border-emerald-500 text-white"
                : isActive ? "bg-primary border-primary text-primary-foreground"
                : "border-gray-200 text-gray-400 bg-white"
              }`}>
                {isDone ? <Check className={iconSz} /> : <Icon className={iconSz} />}
              </div>
              {!compact && (
                <span className={`text-[10px] font-semibold truncate max-w-[56px] ${
                  isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-gray-400"
                }`}>
                  {tab.label}
                </span>
              )}
            </button>

            {i < tabs.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full overflow-hidden bg-gray-100 ${compact ? "" : "mb-4"}`}>
                <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: isDone ? "100%" : "0%" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

// ── ProgressBar ───────────────────────────────────────────────────────────────

const ProgressBar = memo(function ProgressBar({ percent, compact }: { percent: number; compact: boolean }) {
  const isComplete = percent === 100;
  return (
    <div className={compact ? "px-3 pb-2" : "px-4 pb-3"}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-semibold uppercase tracking-widest text-muted-foreground ${compact ? "text-[9px]" : "text-[10px]"}`}>
          Progress
        </span>
        <span className={`font-bold tabular-nums ${compact ? "text-[10px]" : "text-xs"} text-primary`}>
          {isComplete ? "Completed " : `${percent}%`}
        </span>
      </div>
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${compact ? "h-1" : "h-1.5"}`}>
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
});

// ── NavArrows ─────────────────────────────────────────────────────────────────

const NavArrows = memo(function NavArrows({
  onPrev, onNext, disablePrev, disableNext, small,
}: {
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
  small: boolean;
}) {
  const sz = small ? "w-7 h-7" : "w-8 h-8";
  const icSz = small ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0 pr-3">
      <button onClick={onPrev} disabled={disablePrev} aria-label="Previous tab"
        className={`${sz} flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-primary/40 hover:text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors`}>
        <ChevronLeft className={icSz} />
      </button>
      <button onClick={onNext} disabled={disableNext} aria-label="Next tab"
        className={`${sz} flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed transition-opacity`}>
        <ChevronRight className={icSz} />
      </button>
    </div>
  );
});

// ── ProgressHeader ────────────────────────────────────────────────────────────

const ProgressHeader = memo(function ProgressHeader({
  tabs, activeIndex, progress, onTabClick, onPrev, onNext, compact,
}: {
  tabs: SidebarTabDef[];
  activeIndex: number;
  progress: number;
  onTabClick: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  compact: boolean;
}) {
  return (
    <div className="border-b">
      <div className="flex flex-row sm:flex-col lg:flex-row items-center justify-between">
        <TabSteps tabs={tabs} activeIndex={activeIndex} onTabClick={onTabClick} compact={compact} />
        <NavArrows onPrev={onPrev} onNext={onNext} disablePrev={activeIndex === 0} disableNext={activeIndex === tabs.length - 1} small={compact} />
      </div>
      <ProgressBar percent={progress} compact={compact} />
    </div>
  );
});

// ── Main ──────────────────────────────────────────────────────────────────────

export function TabbedSidebarLayout({ tabs, progress = 0 }: TabbedSidebarLayoutProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const sheetRef    = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const dragY       = useRef(0);
  const startY      = useRef<number | null>(null);
  const startTime   = useRef<number | null>(null);
  const raf         = useRef<number | null>(null);
  const closeTimer  = useRef<NodeJS.Timeout | null>(null);

  const activeTab   = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);

  const goPrev = useCallback(() => {
    setActiveTabId((cur) => {
      const i = tabs.findIndex((t) => t.id === cur);
      return i > 0 ? tabs[i - 1].id : cur;
    });
  }, [tabs]);

  const goNext = useCallback(() => {
    setActiveTabId((cur) => {
      const i = tabs.findIndex((t) => t.id === cur);
      return i < tabs.length - 1 ? tabs[i + 1].id : cur;
    });
  }, [tabs]);

  const openOverlay = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveTabId(id);
    setMobileOpen(true);
    setIsVisible(false);
    dragY.current = 0;
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const closeOverlay = useCallback(() => {
    setIsVisible(false);
    if (sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
    closeTimer.current = setTimeout(() => {
      setMobileOpen(false);
      dragY.current = 0;
    }, ANIMATION_MS);
  }, []);

  // Lock body scroll when sheet open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const el = scrollableRef.current;
    if (el && el.scrollTop > 0) { startY.current = null; return; }
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) return;
    e.preventDefault();
    dragY.current = delta;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      if (sheetRef.current) sheetRef.current.style.transform = `translateY(${dragY.current}px)`;
      if (backdropRef.current) {
        const prog = Math.min(dragY.current / (window.innerHeight * 0.9), 1);
        const fade = 0.7;
        const opacity = prog <= fade ? 1 : 1 - Math.pow((prog - fade) / (1 - fade), 2.5);
        backdropRef.current.style.opacity = String(opacity);
      }
      raf.current = null;
    });
  }, []);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !mobileOpen) return;
    sheet.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => sheet.removeEventListener("touchmove", handleTouchMove);
  }, [mobileOpen, handleTouchMove]);

  const handleTouchEnd = useCallback(() => {
    const elapsed = Date.now() - (startTime.current ?? Date.now());
    if (dragY.current > SWIPE_CLOSE_THRESHOLD || dragY.current / elapsed > SWIPE_VELOCITY_THRESHOLD) {
      closeOverlay();
    } else if (sheetRef.current) {
      sheetRef.current.style.transition = SHEET_TRANSITION;
      sheetRef.current.style.transform = "translateY(0)";
    }
    dragY.current = 0;
    startY.current = null;
    startTime.current = null;
  }, [closeOverlay]);

  const handleTabClick = useCallback((tabId: string) => {
    if (mobileOpen) {
      if (activeTabId === tabId) closeOverlay();
      else setActiveTabId(tabId);
    } else {
      openOverlay(tabId);
    }
  }, [mobileOpen, activeTabId, closeOverlay, openOverlay]);

  const headerProps = { tabs, activeIndex, progress, onTabClick: setActiveTabId, onPrev: goPrev, onNext: goNext };

  return (
    <>
      {/* ── DESKTOP ── */}
      <aside className="hidden md:flex md:w-full md:flex-col border-r bg-white">
        <ProgressHeader {...headerProps} compact={false} />
        <div className="p-3 overflow-y-auto flex-1">{activeTab?.content}</div>
      </aside>

      {/* ── MOBILE NAV BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t flex z-30 items-center px-2">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isDone = i < activeIndex;
          const isActive = tab.id === activeTabId;
          return (
            <button key={tab.id} onClick={() => handleTabClick(tab.id)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isDone ? "bg-emerald-500 text-white" : isActive ? "bg-primary text-primary-foreground" : "text-gray-400"
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[10px] ${isActive ? "text-primary font-semibold" : "text-gray-500"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── MOBILE SHEET ── */}
      {mobileOpen && (
        <div ref={backdropRef} className="fixed inset-0 z-20 bg-black/40 flex flex-col"
          style={{ opacity: isVisible ? 1 : 0, transition: BACKDROP_TRANSITION }}
          onClick={closeOverlay}>
          <div ref={sheetRef}
            className="mt-6 mb-16 flex flex-col flex-1 bg-white rounded-t-2xl overflow-hidden"
            style={{ transform: isVisible ? "translateY(0)" : "translateY(100%)", transition: SHEET_TRANSITION }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}>

            {/* Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Title + close */}
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="font-semibold text-sm">{activeTab?.label}</span>
              <button onClick={closeOverlay} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress header — compact */}
            <ProgressHeader {...headerProps} compact={true} />

            {/* Content */}
            <div ref={scrollableRef} className="flex-1 overflow-y-auto p-3">
              {activeTab?.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}