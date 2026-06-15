"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { User, RefreshCw, X, Check } from "lucide-react";

interface PhotoUploaderProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
}

interface FileInfo {
  name: string;
  size: string;
}

function formatSize(bytes: number): string {
  const kb = bytes / 1024;
  return kb < 1024
    ? `${Math.round(kb)} KB`
    : `${(kb / 1024).toFixed(1)} MB`;
}

export function PhotoUploader({ photoUrl, onPhotoChange }: PhotoUploaderProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    onPhotoChange(url);
    setFileInfo({ name: file.name, size: formatSize(file.size) });
  }, [onPhotoChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onPhotoChange(null);
    setFileInfo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Drag & drop ──────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        Upload photo
      </p>

      {/* ── Drop zone (no photo) ──────────────────────────────────────── */}
      {!photoUrl && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload photo — click or drag and drop"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-[1.5px] border-dashed px-6 py-8 text-center",
            "bg-muted/30 transition-colors duration-150",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-foreground/30 hover:bg-muted/50"
          )}
        >
          {/* Avatar placeholder */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              {dragging ? "Drop to upload" : "Drop photo here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse &nbsp;·&nbsp; JPG, PNG, WEBP &nbsp;·&nbsp; up to 5 MB
            </p>
          </div>
        </div>
      )}

      {/* ── Photo row (has photo) ─────────────────────────────────────── */}
      {photoUrl && (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3">
          {/* Avatar with remove button */}
          <div className="relative flex-shrink-0">
            <img
              src={photoUrl}
              alt="Uploaded photo"
              className="h-16 w-16 rounded-full border border-border object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove photo"
              className={cn(
                "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full",
                "bg-destructive/90 text-destructive-foreground",
                "transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
              )}
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* File info */}
          <div className="min-w-0 flex-1">
            {fileInfo && (
              <>
                <p className="truncate text-[13px] font-medium text-foreground">
                  {fileInfo.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{fileInfo.size}</p>
              </>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-md border border-border",
                "bg-transparent px-3 py-1.5 text-xs text-foreground",
                "transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              )}
            >
              <RefreshCw className="h-3 w-3" />
              Change photo
            </button>
          </div>

          {/* Success badge */}
          <div className="flex-shrink-0 self-start">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              Ready
            </span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}