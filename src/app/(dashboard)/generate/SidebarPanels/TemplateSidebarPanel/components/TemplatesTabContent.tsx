"use client";

import { Loader2 } from "lucide-react";
import { CardTypeSelector, type Category } from "../../components/CardTypeSelector";
import { TemplateGrid, type Template } from "./TemplateGrid";

interface TemplatesTabContentProps {
  categories: Category[];
  isLoadingCategories: boolean;
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  isLoading: boolean;
  templates: Template[];
  selectedId: string | null;
  onSelect: (t: Template | null) => void;
}

export function TemplatesTabContent({
  categories,
  isLoadingCategories,
  selectedCategoryId,
  onCategoryChange,
  isLoading,
  templates,
  selectedId,
  onSelect,
}: TemplatesTabContentProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Card Type
        </p>
        <CardTypeSelector
          categories={categories}
          isLoading={isLoadingCategories}
          selected={selectedCategoryId}
          onSelect={onCategoryChange}
        />
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Templates
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Loading…
          </div>
        ) : (
          <TemplateGrid templates={templates} selectedId={selectedId} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}