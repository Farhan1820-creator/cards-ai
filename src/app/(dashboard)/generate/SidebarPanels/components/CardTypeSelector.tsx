import { Button } from "@/components/ui/button";
import { Cake, Heart, Calendar, Mail, Sparkles } from "lucide-react";

const cardTypes = [
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "wedding", label: "Wedding", icon: Heart },
  { id: "anniversary", label: "Anniversary", icon: Calendar },
  { id: "invitation", label: "Invitation", icon: Mail },
  { id: "custom", label: "Custom", icon: Sparkles },
] as const;

type CardType = typeof cardTypes[number]["id"];

interface CardTypeSelectorProps {
  selected: CardType;
  onSelect: (type: CardType) => void;
}

export function CardTypeSelector({ selected, onSelect }: CardTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Card Type</label>
      <div className="flex flex-wrap gap-2">
        {cardTypes.map(({ id, label, icon: Icon }) => (
<Button
  key={id}
  variant={selected === id ? "pill-active" : "pill"}
  size="sm"
  onClick={() => onSelect(id)}
  className="gap-1 text-xs sm:text-sm sm:gap-1.5"
>
  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  {label}
</Button>
        ))}
      </div>
    </div>
  );
}

export type { CardType };
