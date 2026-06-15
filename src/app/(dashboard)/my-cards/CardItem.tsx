"use client";

import Image from "next/image";
import { CheckCircle2, Circle, Pencil, Download, Trash2, Loader2, Share2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle2 as SelectIcon } from "lucide-react";
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

export function CardItem({
  card, isSelected, selectMode, deletingId, isAdmin = false,
  onSelect, onContextMenu, onEdit, onDownload, onDelete, onEnterSelectMode,
  currentUserEmail, onShare
}: CardItemProps) {
  const canEdit = !isAdmin || card.createdByEmail === currentUserEmail; 
  return (
    <div
      className={`
        group relative flex flex-col rounded-2xl overflow-hidden bg-white
        transition-all duration-200 cursor-pointer
        ${selectMode
          ? isSelected
            ? "ring-2 ring-primary shadow-md"
            : "ring-1 ring-border hover:ring-primary/40"
          : "ring-1 ring-border hover:shadow-lg hover:-translate-y-0.5"
        }
      `}
      onClick={() => selectMode && onSelect(card.id)}
      onContextMenu={(e) => onContextMenu(e, card.id)}
    >
      {/* ── Image ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={card.imageUrl}
          alt={`${card.cardType} card`}
          fill
          className={`object-cover transition-all duration-300 ${
            selectMode ? "" : "group-hover:scale-105"
          } ${isSelected ? "brightness-75" : ""}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Select checkmark */}
        {selectMode && (
          <div className="absolute top-2 right-2">
            {isSelected
              ? <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
              : <Circle className="w-5 h-5 text-white/60 drop-shadow" />
            }
          </div>
        )}

        {/* Hover actions overlay — sirf desktop pe */}
{!selectMode && (
  <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 sm:group-hover:opacity-100">
    {canEdit && (
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(card); }}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm hover:scale-110 transition-transform"
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    )}
    <button
      onClick={(e) => { e.stopPropagation(); onDownload(card); }}
      className="h-8 w-8 flex items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm hover:scale-110 transition-transform"
      title="Download"
    >
      <Download className="h-3.5 w-3.5" />
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onShare(card); }}
      className="h-8 w-8 flex items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm hover:scale-110 transition-transform"
      title="Share"
    >
      <Share2 className="h-3.5 w-3.5" />
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
      className="h-8 w-8 flex items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm hover:scale-110 transition-transform"
      title="Delete"
    >
      {deletingId === card.id
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Trash2 className="h-3.5 w-3.5" />
      }
    </button>
  </div>
)}
      </div>

      {/* ── Info bar ── */}
      <div className="flex items-center justify-between px-3 py-2 gap-1">
        {/* Date — always visible; name + admin info on hover via title tooltip */}
        <div
          className="min-w-0 flex-1"
          title={[
            isAdmin && card.createdByName ? `By: ${card.createdByName} (${card.createdByEmail})` : "",
          ].filter(Boolean).join("\n")}
        >
          <p className="text-[11px] text-muted-foreground">{card.createdAt}</p>
          {/* Recipient name — subtle, truncated */}
          {card.recipientName && (
            <p className="text-xs font-medium text-foreground truncate capitalize leading-tight mt-0.5">
              {card.recipientName} {card.cardType}
            </p>
          ) || 
           <p className="text-xs font-medium text-foreground truncate capitalize leading-tight mt-0.5">
             {card.cardType}
            </p>
}
            <p className=" text-[10px] text-muted-foreground truncate capitalize leading-tight mt-0.5">
              {card.createdByName}        
 </p>
        </div>

        <button
  className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
  onClick={(e) => e.stopPropagation()}
></button>

        {/* Kebab menu */}
        {/* Kebab menu — mobile pe hamesha visible, desktop pe hover pe */}
{!selectMode && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
             {canEdit && (
  <DropdownMenuItem onClick={() => onEdit(card)} className="gap-2 cursor-pointer">
    <Pencil className="h-3.5 w-3.5" /> Edit
  </DropdownMenuItem>
)}
              <DropdownMenuItem onClick={() => onDownload(card)} className="gap-2 cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(card)} className="gap-2 cursor-pointer">
  <Share2 className="h-3.5 w-3.5" /> Share
</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEnterSelectMode(card.id)}
                className="gap-2 cursor-pointer"
              >
                <SelectIcon className="h-3.5 w-3.5" /> Select
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(card.id)}
                className="gap-2 cursor-pointer text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}