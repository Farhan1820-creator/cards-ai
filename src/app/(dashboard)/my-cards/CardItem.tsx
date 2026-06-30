"use client";

import Image from "next/image";
import { memo, useCallback } from "react";
import {
  CheckCircle2, Circle, Pencil, Download, Trash2, Loader2,
  Share2, MoreVertical, CheckCircle2 as SelectIcon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CardItem as CardItemType } from "./hooks/useMyCards";

interface CardItemProps {
  card: CardItemType;
  isSelected: boolean;
  selectMode: boolean;
  deletingId: string | null;
  isAdmin?: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onEdit: (card: CardItemType) => void;
  onDownload: (card: CardItemType) => void;
  onDelete: (id: string) => void;
  onEnterSelectMode: (id: string) => void;
  currentUserEmail?: string;
  onShare: (card: CardItemType) => void;
}

function CardItemComponent({
  card, isSelected, selectMode, deletingId, isAdmin = false,
  onSelect, onContextMenu, onEdit, onDownload, onDelete, onEnterSelectMode,
  currentUserEmail, onShare,
}: CardItemProps) {
  const canEdit = !isAdmin || card.createdByEmail === currentUserEmail;
  const isDeleting = deletingId === card.id;

  const handleClick = useCallback(() => {
    if (selectMode) onSelect(card.id);
  }, [selectMode, onSelect, card.id]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => onContextMenu(e, card.id),
    [onContextMenu, card.id]
  );

  const handleEdit = useCallback(() => onEdit(card), [onEdit, card]);
  const handleDownload = useCallback(() => onDownload(card), [onDownload, card]);
  const handleShare = useCallback(() => onShare(card), [onShare, card]);
  const handleDelete = useCallback(() => onDelete(card.id), [onDelete, card.id]);
  const handleEnterSelectMode = useCallback(
    () => onEnterSelectMode(card.id),
    [onEnterSelectMode, card.id]
  );
  const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white transition-all duration-200 cursor-pointer ${
        selectMode
          ? isSelected
            ? "ring-2 ring-primary shadow-sm"
            : "ring-1 ring-border hover:ring-primary/40"
          : "ring-1 ring-border hover:shadow-md "
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={card.imageUrl}
          alt={`${card.categoryName} card`}
          fill
          className={`object-cover transition-transform duration-300 ${
            selectMode ? "" : ""
          } ${isSelected ? "brightness-75" : ""}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {selectMode && (
          <div className="absolute top-2 right-2">
            {isSelected
              ? <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
              : <Circle className="w-5 h-5 text-white/60 drop-shadow" />}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-2 gap-1">
        <div
          className="min-w-0 flex-1"
          title={isAdmin && card.createdByName ? `By: ${card.createdByName} (${card.createdByEmail})` : undefined}
        >
          <p className="text-[11px] text-muted-foreground">{card.createdAt}</p>
          <p className="text-xs font-medium text-foreground truncate capitalize leading-tight mt-0.5">
            {card.recipientName ? `${card.recipientName} ${card.categoryName}` : card.categoryName}
          </p>
          <p className="text-[10px] text-muted-foreground truncate  leading-tight mt-0.5">
            {card.createdByEmail}
          </p>
        </div>

        {!selectMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
    <button
  className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors opacity-100"
  onClick={stopPropagation}
>
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {canEdit && (
                <DropdownMenuItem onClick={handleEdit} className="gap-2 cursor-pointer">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDownload} className="gap-2 cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
                <Share2 className="h-3.5 w-3.5" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEnterSelectMode} className="gap-2 cursor-pointer">
                <SelectIcon className="h-3.5 w-3.5" /> Select
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 cursor-pointer text-red-500 focus:text-red-500"
              >
                {isDeleting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />}
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export const CardItem = memo(CardItemComponent);