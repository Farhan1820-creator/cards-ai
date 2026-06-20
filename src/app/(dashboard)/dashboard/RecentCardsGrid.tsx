"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Pencil, Download, Trash2, Loader2, Share2, Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BulkDeleteOverlay } from "@/app/(dashboard)/my-cards/BulkDeleteOverlay";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DeletionPhase } from "@/app/(dashboard)/my-cards/hooks/useMyCards";
import { downloadImage } from "@/lib/download-image";
import { toast } from "sonner";

interface CardItem {
  id: string;
  imageUrl: string;
  cardType: string;
  recipientName: string;
  createdAt: string;
}

export function RecentCardsGrid({ cards: initialCards }: { cards: CardItem[] }) {
  const [cards, setCards] = useState(initialCards);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletionPhase, setDeletionPhase] = useState<DeletionPhase>("idle");

  const handleDelete = async (cardId: string) => {
    setDeletingId(cardId);
    setConfirmDeleteId(null);
    setDeletionPhase("deleting");

    try {
      const res = await fetch(`/api/user-cards/${cardId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error();

      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setDeletionPhase("done");
      setTimeout(() => setDeletionPhase("idle"), 1200);
    } catch {
      setDeletionPhase("idle");
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = async (imageUrl: string, cardType: string, recipientName: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const filename = `${cardType}${recipientName ? `-${recipientName}` : ""}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "My Card", files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: "My Card", url: imageUrl });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  };

  const handleDownload = async (imageUrl: string, cardType: string, recipientName: string) => {
    const filename = `${cardType}${recipientName ? `-${recipientName}` : ""}.png`;
    try {
      await downloadImage(imageUrl, filename);
    } catch {
      // silent fail
    }
  };

  return (
    <>
      {cards.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
            <Plus className="h-6 w-6 text-violet-600" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No cards yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate your first AI card to see it here
          </p>
          <Link href="/generate">
            <Button variant="outline" size="sm">Create your first card</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white ring-1 ring-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={card.imageUrl}
                    alt={`${card.cardType} card`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  {/* Kebab menu — sirf hover pe visible, saari actions isi ke andar */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-foreground shadow hover:bg-white transition"
                          title="More actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                          <Link href={`/generate?cardId=${card.id}`}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(card.imageUrl, card.cardType, card.recipientName)}
                          className="gap-2 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShare(card.imageUrl, card.cardType, card.recipientName)}
                          className="gap-2 cursor-pointer"
                        >
                          <Share2 className="h-3.5 w-3.5" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setConfirmDeleteId(card.id)}
                          disabled={deletingId === card.id}
                          className="gap-2 cursor-pointer text-red-500 focus:text-red-500"
                        >
                          {deletingId === card.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="px-3 py-2.5">
                  <p className="text-xs font-medium text-foreground truncate capitalize">
                    {card.recipientName
                      ? `${card.cardType} · ${card.recipientName}`
                      : card.cardType}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{card.createdAt}</p>
                </div>
              </div>
            ))}
          </div>

          <AlertDialog
            open={!!confirmDeleteId}
            onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this card?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                >
                  {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <BulkDeleteOverlay phase={deletionPhase} count={1} />
        </>
      )}
    </>
  );
}