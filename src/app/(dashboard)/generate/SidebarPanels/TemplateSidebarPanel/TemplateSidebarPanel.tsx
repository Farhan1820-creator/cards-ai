"use client";

import { Loader2 } from "lucide-react";
import { CardTypeSelector, type CardType } from "../components/CardTypeSelector";
import { TemplateGrid, type Template } from "./components/TemplateGrid";
import { PhotoUploader } from "./components/PhotoUploader";
import { ColorPicker } from "./components/ColorPicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MAX_MESSAGE_LENGTH   = 200;
const MAX_RECIPIENT_LENGTH = 25;

interface TemplateSidebarPanelProps {
  // card type
  cardType: CardType;
  onCardTypeChange: (t: CardType) => void;
  // templates
  templates: Template[];
  isTempLoading: boolean;
  selectedTemplate: Template | null;
  onTemplateSelect: (t: Template | null) => void;
  // inputs
  recipientName: string;
  onRecipientNameChange: (v: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
  nameColor: string;
  onNameColorChange: (v: string) => void;
  messageColor: string;
  onMessageColorChange: (v: string) => void;
  // photo
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  isEditing?: boolean; 
}

export function TemplateSidebarPanel({
  cardType, onCardTypeChange,
  templates, isTempLoading, selectedTemplate, onTemplateSelect,
  recipientName, onRecipientNameChange,
  message, onMessageChange,
  nameColor, onNameColorChange,
  messageColor, onMessageColorChange,
  photoUrl, onPhotoChange,
}: TemplateSidebarPanelProps) {
  const templateChosen = selectedTemplate !== null;
  const filteredTemplates = templates.filter(
    (t) => t.category.toLowerCase().trim() === cardType.toLowerCase().trim()
  );

  return (
   // Outer div — overflow fix
<div className="flex flex-col gap-3 overflow-y-auto h-full pr-0.5">

  {/* Card Type section — same */}
  <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      Card Type
    </p>
    <CardTypeSelector selected={cardType} onSelect={onCardTypeChange} />
  </div>

  {/* Templates section — max height add karo mobile pe scroll ke liye */}
  <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      Templates
    </p>
    {isTempLoading ? (
      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Loading…
      </div>
    ) : (
        <TemplateGrid
          templates={filteredTemplates}
          selectedId={selectedTemplate?.id ?? null}
          onSelect={onTemplateSelect}
        />
    )}
  </div>

  {/* Personalize section */}
  <div
    className={`rounded-xl border border-border/60 bg-card p-3 shadow-sm space-y-4 transition-opacity duration-200 ${
      !templateChosen ? "opacity-40 pointer-events-none" : ""
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      Personalize
    </p>

    {!templateChosen && (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-center text-[11px] text-muted-foreground">
        Select a template to unlock
      </p>
    )}

    {/* Recipient name */}
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="recipient-name" className="text-xs font-medium text-foreground">
          Recipient Name
        </label>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {recipientName.length}/{MAX_RECIPIENT_LENGTH}
        </span>
      </div>
      <Input
        id="recipient-name"
        placeholder="e.g. Sarah, Ali & Ayesha"
        value={recipientName}
        maxLength={MAX_RECIPIENT_LENGTH}
        disabled={!templateChosen}
        className="h-8 text-sm"
        onChange={(e) => onRecipientNameChange(e.target.value.slice(0, MAX_RECIPIENT_LENGTH))}
      />
      <ColorPicker
        label="Name Color"
        color={nameColor}
        onChange={onNameColorChange}
        disabled={!templateChosen}
      />
    </div>

    <div className="h-px bg-border/50" />

    {/* Message */}
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="message" className="text-xs font-medium text-foreground">
          Message
        </label>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {message.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
      <Textarea
        id="message"
        placeholder="Wishing you a day filled with joy..."
        value={message}
        onChange={(e) => onMessageChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
        rows={3}
        disabled={!templateChosen}
        className="resize-none text-sm"
      />
      <ColorPicker
        label="Message Color"
        color={messageColor}
        onChange={onMessageColorChange}
        disabled={!templateChosen}
      />
    </div>

    <div className="h-px bg-border/50" />

    {/* Photo */}
    <PhotoUploader photoUrl={photoUrl} onPhotoChange={onPhotoChange} />
  </div>
</div>

  );
}