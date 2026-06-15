import { cn } from "@/lib/utils";

const colorThemes = [
  { id: "pastel", label: "Pastel", colors: ["#fce7f3", "#ddd6fe", "#cffafe"] },
  { id: "purple-blue", label: "Purple & Blue", colors: ["#8b5cf6", "#3b82f6", "#06b6d4"] },
  { id: "gold-white", label: "Gold & White", colors: ["#f59e0b", "#fef3c7", "#ffffff"] },
  { id: "rose", label: "Rose", colors: ["#fb7185", "#fda4af", "#fecdd3"] },
  { id: "earth", label: "Earth", colors: ["#78716c", "#a8a29e", "#d6d3d1"] },
  { id: "custom", label: "Custom", colors: ["linear-gradient(135deg, #667eea 0%, #764ba2 100%)"] },
] as const;

type ColorTheme = typeof colorThemes[number]["id"];

interface ColorThemeSelectorProps {
  selected: ColorTheme;
  onSelect: (theme: ColorTheme) => void;
}

export function ColorThemeSelector({ selected, onSelect }: ColorThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Color Theme</label>
      <div className="flex flex-wrap gap-3">
        {colorThemes.map(({ id, label, colors }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all duration-200",
              "hover:bg-secondary",
              selected === id && "bg-secondary ring-2 ring-primary ring-offset-2"
            )}
          >
            <div className="flex -space-x-1">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 border-card shadow-sm",
                    "transition-transform group-hover:scale-110"
                  )}
                  style={{ 
                    background: color.includes("gradient") ? color : color,
                    zIndex: colors.length - index 
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export type { ColorTheme };
