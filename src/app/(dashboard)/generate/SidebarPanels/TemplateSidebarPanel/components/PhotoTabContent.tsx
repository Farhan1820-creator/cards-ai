"use client";

import { PhotoUploader } from "./PhotoUploader";

interface PhotoTabContentProps {
  templateChosen: boolean;
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
}

export function PhotoTabContent({ templateChosen, photoUrl, onPhotoChange }: PhotoTabContentProps) {
  return (
    <div
      className={`rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-opacity duration-200 ${
        !templateChosen ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {!templateChosen && (
        <p className="mb-3 rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-center text-[11px] text-muted-foreground">
          Select a template to unlock
        </p>
      )}
      <PhotoUploader photoUrl={photoUrl} onPhotoChange={onPhotoChange} />
    </div>
  );
}