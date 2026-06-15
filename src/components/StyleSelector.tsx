import { Button } from "@/components/ui/button";

const styles = [
  { id: "minimal", label: "Minimal" },
  { id: "floral", label: "Floral" },
  { id: "modern", label: "Modern" },
  { id: "elegant", label: "Elegant" },
  { id: "cute", label: "Cute" },
] as const;

type CardStyle = typeof styles[number]["id"];

interface StyleSelectorProps {
  selected: CardStyle;
  onSelect: (style: CardStyle) => void;
}

export function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Style</label>
      <div className="flex flex-wrap gap-2">
        {styles.map(({ id, label }) => (
          <Button
            key={id}
            variant={selected === id ? "pill-active" : "pill"}
            size="sm"
            onClick={() => onSelect(id)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export type { CardStyle };
