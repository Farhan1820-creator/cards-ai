"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Save } from "lucide-react";
import { toast } from "sonner";
import { ColorPicker } from "@/app/(dashboard)/generate/SidebarPanels/TemplateSidebarPanel/components/ColorPicker";

const MAX_RECIPIENT_LENGTH = 25;
const MAX_MESSAGE_LENGTH   = 200;

export interface EditableCard {
  id:            string;
  imageUrl:      string;
  cardType:      string;
  recipientName: string;
  createdAt:     string;
  nameColor:     string;    
  messageColor:  string;     
  photoUrl:      string;     
  prompt:        string;     
  templateId:    string; 
}

interface EditCardModalProps {
  card: EditableCard | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updatedCard: EditableCard) => void;
}

export function EditCardModal({ card, open, onClose, onSaved }: EditCardModalProps) {
  const [recipientName, setRecipientName] = useState("");
  const [message,       setMessage]       = useState("");
  const [nameColor,     setNameColor]     = useState("#ffffff");
  const [messageColor,  setMessageColor]  = useState("#ffffff");
  const [isSaving,      setIsSaving]      = useState(false);
  const [previewUrl,    setPreviewUrl]    = useState<string>("");

  // Sync state when card changes
  useEffect(() => {
    if (card) {
      setRecipientName(card.recipientName ?? "");
      setMessage("");
      setNameColor("#ffffff");
      setMessageColor("#ffffff");
      setPreviewUrl(card.imageUrl);
    }
  }, [card]);

  const handleSave = useCallback(async () => {
    if (!card) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          cardType: card.cardType,
          // Only send new image if canvas produced one (future enhancement)
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Save failed");
      toast.success("Card updated!");
      onSaved({
        ...card,
        recipientName,
        imageUrl: data.card.imageUrl,
      });
      onClose();
    } catch {
      toast.error("Could not save changes");
    } finally {
      setIsSaving(false);
    }
  }, [card, recipientName, onSaved, onClose]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${recipientName || "card"}-${card?.cardType ?? "card"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloaded!");
  }, [previewUrl, recipientName, card]);

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-base font-semibold">Edit Card</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">

          {/* ── Left: current card image preview ── */}
          <div className="flex flex-col items-center justify-center bg-muted/30 p-6 gap-4">
            <div className="w-full max-w-xs aspect-square rounded-xl overflow-hidden border border-border shadow-md relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Card preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay showing updated name */}
              {recipientName && (
                <div
                  className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none"
                  style={{ color: nameColor }}
                >
                  <span className="text-lg font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                    {recipientName}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              Image preview · Changes apply on save
            </p>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              Download Current
            </Button>
          </div>

          {/* ── Right: edit fields ── */}
          <div className="flex flex-col gap-5 p-6">

            {/* Card type badge */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium capitalize text-violet-700">
                {card.cardType}
              </span>
              <span className="text-xs text-muted-foreground">{card.createdAt}</span>
            </div>

            {/* Recipient Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Recipient Name</label>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {recipientName.length}/{MAX_RECIPIENT_LENGTH}
                </span>
              </div>
              <Input
                placeholder="e.g. Sarah, Ali & Ayesha"
                value={recipientName}
                maxLength={MAX_RECIPIENT_LENGTH}
                className="h-8 text-sm"
                onChange={(e) => setRecipientName(e.target.value.slice(0, MAX_RECIPIENT_LENGTH))}
              />
              <ColorPicker
                label="Name Color"
                color={nameColor}
                onChange={setNameColor}
              />
            </div>

            <div className="h-px bg-border/60" />

            {/* Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Message</label>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
              <Textarea
                placeholder="Wishing you a day filled with joy..."
                value={message}
                rows={4}
                className="resize-none text-sm"
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              />
              <ColorPicker
                label="Message Color"
                color={messageColor}
                onChange={setMessageColor}
              />
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex-1 gap-2 bg-violet-600 hover:bg-violet-700"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><Save className="h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}