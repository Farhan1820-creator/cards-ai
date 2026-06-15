"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RecipientNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecipientNameInput({
  value,
  onChange,
}: RecipientNameInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="recipient-name">
        Recipient Name
      </Label>

      <Input
        id="recipient-name"
        type="text"
        placeholder="e.g. Sarah, Ali & Ayesha, Team Marketing"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <p className="text-sm text-muted-foreground">
        This name will appear on the card (e.g. “Happy Birthday Sarah”)
      </p>
    </div>
  );
}
