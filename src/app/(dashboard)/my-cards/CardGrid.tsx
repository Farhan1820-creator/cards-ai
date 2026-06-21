"use client";

import { X } from "lucide-react";
import { CardItem } from "./CardItem";
import { EmptyCardsState } from "./EmptyCardsState";
import type { CardItem as CardItemType } from "./hooks/useMyCards";
import { generateCardFilename } from "@/lib/filename";
import { useCallback } from "react";
import { toast } from "sonner";

interface CardGridProps {
  cards: CardItemType[];
  selectMode: boolean;
  selectedIds: Set<string>;
  deletingId: string | null;
  isAdmin?: boolean;
  isAllSelected: boolean;
  onSelect: (id: string) => void;
  onExitSelectMode: () => void;
  onSelectAll: () => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onEdit: (card: CardItemType) => void;
  onDownload: (card: CardItemType) => void;
  onDelete: (id: string) => void;
  onEnterSelectMode: (id: string) => void;
  currentUserEmail?: string;
}

export function CardGrid({
  cards, selectMode, selectedIds, deletingId, isAdmin = false,
  isAllSelected, onSelect, onExitSelectMode, onSelectAll,
  onContextMenu, onEdit, onDownload, onDelete, onEnterSelectMode,
   currentUserEmail,
}: CardGridProps) {
  

const handleShare = useCallback(async (card: CardItemType) => {
  try {
    const res = await fetch(card.imageUrl);
    const blob = await res.blob();
    const file = new File(
      [blob],
      // ✅ card.cardType abhi bhi backend se aata hai — reuse karo
      generateCardFilename(card.categoryName || "card", card.recipientName),
      { type: "image/png" }
    );

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "My Card", files: [file] });
    } else if (navigator.share) {
      await navigator.share({ title: "My Card", url: card.imageUrl });
    } else {
      await navigator.clipboard.writeText(card.imageUrl);
      toast.success("Link copied to clipboard!");
    }
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      toast.error("Share failed");
    }
  }
}, []);

  return (
    <>
      {/* Select mode top bar */}
      {selectMode && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitSelectMode}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} selected
            </span>
          </div>
          <button
            onClick={isAllSelected ? onExitSelectMode : onSelectAll}
            className="text-sm text-primary font-medium hover:opacity-70 transition-opacity"
          >
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && !selectMode && <EmptyCardsState />}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            isSelected={selectedIds.has(card.id)}
            selectMode={selectMode}
            deletingId={deletingId}
            isAdmin={isAdmin}
            onSelect={onSelect}
            onContextMenu={onContextMenu}
            onEdit={onEdit}
            onDownload={onDownload}
            onDelete={onDelete}
            onEnterSelectMode={onEnterSelectMode}
            currentUserEmail={currentUserEmail}
            onShare={handleShare}
          />
        ))}
      </div>
    </>
  );
}