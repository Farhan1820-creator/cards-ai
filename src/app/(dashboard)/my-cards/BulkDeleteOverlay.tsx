"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, CheckCircle2 } from "lucide-react";
import { DeletionPhase } from "./hooks/useMyCards";

interface BulkDeleteOverlayProps {
  phase: DeletionPhase;
  count: number;
}

export function BulkDeleteOverlay({ phase, count }: BulkDeleteOverlayProps) {
  const [visible,     setVisible]     = useState(false);
  const [frozenCount, setFrozenCount] = useState(count);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    clearTimeout(hideTimer.current!);

    if (phase === "deleting") {
      setFrozenCount(count);
      setVisible(true);
    } else if (phase === "done") {
      setVisible(true);
    } else {
      // idle — transition complete hone ke baad unmount
      hideTimer.current = setTimeout(() => setVisible(false), 300);
    }

    return () => clearTimeout(hideTimer.current!);
  }, [phase, count]);

  if (!visible) return null;

  const label = frozenCount <= 1 ? "card" : `${frozenCount} cards`;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-white/90 dark:bg-black/90 backdrop-blur-md
        transition-opacity duration-300
        ${phase === "idle" ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      {phase === "deleting" ? (
        <div className="flex flex-col items-center gap-5 select-none">
          {/* Icon with ping ring */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-950 animate-ping opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500 animate-bounce" />
            </div>
          </div>

          {/* Dot loader */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-red-400"
                style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>

          <p className="text-sm font-medium text-foreground">Deleting {label}…</p>
          <p className="text-xs text-muted-foreground">Please wait</p>
        </div>
      ) : phase === "done" ? (
        <div className="flex flex-col items-center gap-5 select-none animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {frozenCount <= 1 ? "Card deleted" : `${frozenCount} cards deleted`}
          </p>
        </div>
      ) : null}
    </div>
  );
}