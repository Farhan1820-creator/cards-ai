import { cn } from "@/lib/utils";
import { Sparkles, LayoutTemplate } from "lucide-react";

export type GeneratorMode = "ai" | "template";

interface ModeSelectorProps {
  mode: GeneratorMode;
  onModeChange: (mode: GeneratorMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-lg border border-border bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => onModeChange("template")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
            mode === "template"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-light hover:text-primary"
          )}
        >
          <LayoutTemplate className="h-4 w-4" />
          Template Mode
        </button>
        <button
          type="button"
          onClick={() => onModeChange("ai")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
            mode === "ai"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-light hover:text-primary"
          )}
        >
          <Sparkles className="h-4 w-4" />
          AI Generator
        </button>
      </div>
    </div>
  );
}
