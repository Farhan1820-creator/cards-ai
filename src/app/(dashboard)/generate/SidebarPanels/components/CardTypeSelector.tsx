import { Button } from "@/components/ui/button";
import { Grid2X2 } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CardTypeSelectorProps {
  categories: Category[];
  selected: string; // categoryId ya "all"
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function CardTypeSelector({
categories = [], 
  selected,
  onSelect,
  isLoading,
}: CardTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Card Type</label>
      <div className="flex flex-wrap gap-2">
        {/* "All" always show */}
        <Button
          variant={selected === "all" ? "pill-active" : "pill"}
          size="sm"
          onClick={() => onSelect("all")}
          className="gap-1 text-xs sm:text-sm sm:gap-1.5"
        >
          <Grid2X2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          All
        </Button>

        {isLoading
          ? // Skeleton buttons
            Array.from({ length: 4 }).map((_, i) => (
              <Button
                key={i}
                variant="pill"
                size="sm"
                disabled
                className="gap-1 text-xs sm:text-sm w-20 animate-pulse bg-muted"
              />
            ))
          : categories.map(({ id, name }) => (
              <Button
                key={id}
                variant={selected === id ? "pill-active" : "pill"}
                size="sm"
                onClick={() => onSelect(id)}
                className="gap-1 text-xs sm:text-sm sm:gap-1.5"
              >
                {name}
              </Button>
            ))}
      </div>
    </div>
  );
}