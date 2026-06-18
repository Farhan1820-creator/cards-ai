"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "./ColorPicker";

const MAX_MESSAGE_LENGTH = 200;
const MAX_RECIPIENT_LENGTH = 25;

interface PersonalizeTabContentProps {
  templateChosen: boolean;
  recipientName: string;
  onRecipientNameChange: (v: string) => void;
  nameColor: string;
  onNameColorChange: (v: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
  messageColor: string;
  onMessageColorChange: (v: string) => void;
}

export function PersonalizeTabContent({
  templateChosen,
  recipientName, onRecipientNameChange,
  nameColor, onNameColorChange,
  message, onMessageChange,
  messageColor, onMessageColorChange,
}: PersonalizeTabContentProps) {
  return (
    <div
      className={`rounded-xl border border-border/60 bg-card p-3 shadow-sm space-y-4 transition-opacity duration-200 ${
        !templateChosen ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {!templateChosen && (
        <p className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-center text-[11px] text-muted-foreground">
          Select a template to unlock
        </p>
      )}

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
        <ColorPicker label="Name Color" color={nameColor} onChange={onNameColorChange} disabled={!templateChosen} />
      </div>

      <div className="h-px bg-border/50" />

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
        <ColorPicker label="Message Color" color={messageColor} onChange={onMessageColorChange} disabled={!templateChosen} />
      </div>
    </div>
  );
}