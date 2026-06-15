"use client";

import { useEffect, useState } from "react";
import { Trash2, CheckCircle2 } from "lucide-react";
import { DeletionPhase } from "./hooks/useMyCards";

interface BulkDeleteOverlayProps {
  phase: DeletionPhase;
  count: number;
}

export function BulkDeleteOverlay({ phase, count }: BulkDeleteOverlayProps) {
  const [visible,      setVisible]      = useState(false);
  const [frozenCount,  setFrozenCount]  = useState(count);

  useEffect(() => {
    if (phase === "deleting") {
      setFrozenCount(count);
      setVisible(true);
    } else if (phase === "done") {
      setVisible(true);
    } else {
      // idle — fade out ke baad hide karo
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [phase, count]);

  if (!visible) return null;

  const isSingle = frozenCount <= 1;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-white/90 dark:bg-black/90 backdrop-blur-md
        transition-opacity duration-300
        ${phase === "idle" ? "opacity-0" : "opacity-100"}
      `}
    >
      {phase === "deleting" && (
        <div className="flex flex-col items-center gap-5 select-none">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-red-50 dark:bg-red-950 animate-ping opacity-30" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-950">
              <Trash2 className="w-8 h-8 text-red-500 animate-bounce" />
            </div>
          </div>

          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-red-400"
                style={{
                  animation: "pulse 1s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          <p className="text-sm font-medium text-foreground">
            {isSingle ? "Deleting card…" : `Deleting ${frozenCount} cards…`}
          </p>
          <p className="text-xs text-muted-foreground">Please wait</p>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-5 select-none animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isSingle ? "Card deleted" : `${frozenCount} cards deleted`}
          </p>
        </div>
      )}
    </div>
  );
}