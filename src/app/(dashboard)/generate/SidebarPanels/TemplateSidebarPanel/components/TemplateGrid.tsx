"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Ban, Check } from "lucide-react";
import { memo, useCallback } from "react";        
import type { CardType } from "../../components/CardTypeSelector";
import { type OverlayConfig } from "@/app/(dashboard)/templates/OverlayConfigurator"; 


export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: Exclude<CardType, "custom">;
  overlayConfig?: OverlayConfig | null;

}

export const NONE_TEMPLATE_ID = "__none__";

interface TemplateGridProps {
  templates: Template[];
  selectedId: string | null;
  onSelect: (template: Template | null) => void;
}

const TILE_BASE = cn(
  "group relative overflow-hidden rounded-md border-2 bg-card transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
);
const TILE_SELECTED = "border-primary shadow-md";
const TILE_IDLE = "border-border hover:border-muted-foreground/30 hover:shadow-sm";

function truncateToTwoWords(text: string): string {
  const words = text.trim().split(/\s+/);
  return words.length <= 2 ? text : `${words[0]} ${words[1]}…`;
}

function CheckBadge() {
  return (
    <div className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <Check className="h-2 w-2" />
    </div>
  );
}

const NoneTile = memo(function NoneTile({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(TILE_BASE, selected ? TILE_SELECTED : TILE_IDLE)}
    >
      <div className="aspect-[3/4] w-full flex items-center justify-center bg-muted/60">
        <Ban className="h-4 w-4 text-muted-foreground/40" />
      </div>
      <div className="py-0.5 text-center">
        <span className="block text-[9px] font-medium text-foreground">None</span>
      </div>
      {selected && <CheckBadge />}
    </button>
  );
});

const TemplateTile = memo(function TemplateTile({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: (t: Template) => void;
  sizes: string
  
}) {
  const label = truncateToTwoWords(template.name);
  

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={cn(TILE_BASE, selected ? TILE_SELECTED : TILE_IDLE)}
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted relative">
        <Image
          src={template.thumbnail}
          alt={template.name}
          fill
          sizes="(max-width: 768px) 25vw, 100px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="py-0.5 text-center">
        <span
          className="block text-[9px] font-medium text-foreground truncate px-0.5"
          title={template.name}
        >
          {label}
        </span>
      </div>
      {selected && <CheckBadge />}
    </button>
  );
});

export const TemplateGrid = memo(function TemplateGrid({
  templates,
  selectedId,
  onSelect,
}: TemplateGridProps) {
  const noneSelected = !selectedId || selectedId === NONE_TEMPLATE_ID;

  const handleNone     = useCallback(() => onSelect(null), [onSelect]);
  // ✅ Inline wrap — ESLint requires first arg to be an inline function expression
  const handleTemplate = useCallback((t: Template) => onSelect(t), [onSelect]);

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-foreground">Select Template</p>

<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
    <NoneTile selected={noneSelected} onSelect={handleNone} />
    {templates.map((template) => (
      <TemplateTile
        key={template.id}
        template={template}
        selected={selectedId === template.id}
        onSelect={handleTemplate}
        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 100px"
      />
    ))}
  </div>
</div>
  );
});