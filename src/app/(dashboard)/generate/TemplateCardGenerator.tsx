"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {  Check, Loader2} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Category } from "./SidebarPanels/components/CardTypeSelector";
import { type Template } from "./SidebarPanels/TemplateSidebarPanel/components/TemplateGrid";
import { TemplatePreview } from "./TemplatePreview";
import { toast } from "sonner";
import { ActionButtons } from "@/app/(dashboard)/generate/ActionButtons";
import { useCardActions } from "@/app/(dashboard)/generate/hooks/useCardActions";
import Link from "next/link";

interface TemplateCardGeneratorProps {
  categories: Category[];
  selectedCategoryId: string; 
  selectedTemplate: Template | null;
  photoUrl: string | null;
  onRemovePhoto: () => void;
  recipientName: string;
  message: string;
  nameColor: string;
  messageColor: string;
  onReset: () => void;
  existingCardUrl?: string | null;
  existingCardId?: string | null; 
  onExistingCardDismiss?: () => void;
  isEditing?: boolean;
  hasChanges?: boolean;
  onSaved?: (cardId?: string) => void;
   photoTransform?: { scale: number; offsetX: number; offsetY: number };
  onTransformChange?: (t: { scale: number; offsetX: number; offsetY: number }) => void;
}

export function TemplateCardGenerator({
  categories,
  selectedCategoryId, 
  selectedTemplate,
  photoUrl,
  onRemovePhoto,
  recipientName,
  message,
  nameColor,
  messageColor,
  onReset,
  // existingCardUrl,
  existingCardId,
  // onExistingCardDismiss,
  isEditing = false,
  hasChanges = false,
  onSaved,
    photoTransform,
  onTransformChange,
}: TemplateCardGeneratorProps) {

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const initialIsEditing = useRef(isEditing);

  const latestImageRef = useRef<string | null>(null);
const selectedCategoryName =
  categories.find((c) => c.id === selectedCategoryId)?.name ?? "card";

  const templateChosen = selectedTemplate !== null;
const canGenerate = templateChosen; 
 const readyResolver = useRef<((url: string) => void) | null>(null);

const handlePreviewReady = useCallback((dataUrl: string) => {
  setFinalImage(dataUrl);
  latestImageRef.current = dataUrl;
  readyResolver.current?.(dataUrl);
  readyResolver.current = null;
}, []);

const waitForPreview = useCallback(() => {
  return new Promise<string>((resolve) => {
    readyResolver.current = resolve;
    // optional safety timeout, race ke against
    setTimeout(() => resolve(latestImageRef.current ?? ""), 4000);
  });
}, []);

const abortControllerRef = useRef<AbortController | null>(null);




const autoSaveCardRef = useRef<((image: string) => Promise<void>) | null>(null);

const autoSaveCard = useCallback(async (image: string) => {
  if (!selectedTemplate || !image) return;

  abortControllerRef.current?.abort();
  const controller = new AbortController();
  abortControllerRef.current = controller;

  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const approxBytes = (image.length * 3) / 4;
  const MAX_BYTES = 9 * 1024 * 1024;
  if (approxBytes > MAX_BYTES) {
    // Silent — preview + download already work locally, background save just skipped
    console.warn("Auto-save skipped: image too large");
    clearTimeout(timeoutId);
    return;
  }
  try {
    const url = isEditing ? `/api/user/cards/${existingCardId}` : "/api/user/cards/generate/template";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image, recipientName, message,
        nameColor, messageColor, photoUrl,
        templateId: selectedTemplate.id,
        categoryId: selectedTemplate.categoryId,
        photoTransform,
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`save_failed_${res.status}`);

    const data: { card?: { id?: string } } = await res.json().catch(() => ({}));
    onSaved?.(data.card?.id);
  } catch (err) {
    // Silent by design — fast UX, no toast. Logged for debugging only.
    console.error("Background auto-save failed:", err);
  } finally {
    clearTimeout(timeoutId);
  }
}, [isEditing, existingCardId, selectedTemplate, recipientName, message, nameColor, messageColor, photoUrl, photoTransform, onSaved]);
useEffect(() => {
  autoSaveCardRef.current = autoSaveCard;
}, [autoSaveCard]);
// component unmount ya navigate away pe pending request cancel
useEffect(() => {
  return () => abortControllerRef.current?.abort();
}, []);

const [pendingGenerate, setPendingGenerate] = useState(false);

const handleGenerate = useCallback(() => {
  if (!canGenerate || isLoading) return;
  setIsGenerated(false);
  setIsLoading(true);
  setPendingGenerate(true);   // bas flag set karo, baaki effect sambhalega
}, [canGenerate, isLoading]);

// Jab bhi preview ready ho: turant show karo, isLoading turant false —
// auto-save background mein chalta rahega (fire-and-forget), UI uska wait nahi karti
useEffect(() => {
  if (!pendingGenerate || !finalImage) return;

  setPendingGenerate(false);
  setIsGenerated(true);
  setIsLoading(false);           // ← instant preview, save ka wait nahi
  autoSaveCard(finalImage);      // background save, fire-and-forget
}, [pendingGenerate, finalImage, autoSaveCard]);

// Safety: agar preview kabhi ready hi na ho to user stuck na rahe
useEffect(() => {
  if (!pendingGenerate) return;
  const id = setTimeout(() => {
    setPendingGenerate(false);
    setIsLoading(false);
    toast.error("Preview image not ready, try again");
  }, 4000);
  return () => clearTimeout(id);
}, [pendingGenerate]);
 
const { handleDownload, handleShare } = useCardActions(
  finalImage,
  selectedCategoryName,
  recipientName
);


  const handleReset = useCallback(() => {
    setIsGenerated(false);
    setFinalImage(null);
    latestImageRef.current = null;
    onReset();
    toast.info("Form reset");
  }, [onReset]);

  // ✅ Button reflects generate state only — background autosave never blocks/labels UI
  let buttonText = isEditing ? "Update Card" : "Generate Card";
let isButtonDisabled = !canGenerate || isLoading;

if (isLoading) {
  buttonText = isEditing ? "Updating…" : "Creating…";
} else if (isGenerated && hasChanges) {
  // saved ho chuka lekin user ne changes kiye → re-enable
  buttonText = "Update Card";
  isButtonDisabled = false;
} else if (isGenerated && !hasChanges) {
buttonText = initialIsEditing.current ? "Updated" : "Generated"; // ← isEditing nahi, initial value
  isButtonDisabled = true;
} else if (isEditing && !hasChanges) {
  isButtonDisabled = true;
}

  return (
    <div className="flex flex-col gap-2 md:gap-4 h-full">
      {/* Preview */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex-1 relative">
        <div className="block">
          <TemplatePreview
  template={selectedTemplate}
  recipientName={recipientName}
  message={message}
  photoUrl={photoUrl}
  isGenerated={isGenerated}
  isLoading={isLoading}
  nameColor={nameColor}
  messageColor={messageColor}
  onPreviewReady={handlePreviewReady}
  onRemovePhoto={onRemovePhoto}
  isEditing={isEditing}
  photoTransform={photoTransform}
  onTransformChange={onTransformChange}
overlayConfig={selectedTemplate?.overlayConfig ?? undefined}  // ← add yeh line
/>
        </div>
      </div>

      {/* Main Action Button */}
      <Button
        size="lg"
        className="w-full h-10 text-sm font-semibold shadow-md transition-all bg-black hover:bg-black/85"
        onClick={handleGenerate}
        disabled={isButtonDisabled}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (isGenerated && !hasChanges) ? (
          <Check className="mr-2 h-4 w-4" />
        ) : null}
        {buttonText}
      </Button>

      

     {/* New Card Button */}
     {(isGenerated || isEditing) && (
      <div className="flex flex-col gap-2 md:gap-4">
<Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full h-10 text-sm font-semibold"
        disabled={!finalImage || isLoading}
        onClick={() => {
          window.location.href = "/generate";
        }}
      >
        New Card
      </Button>

  <ActionButtons
    hasPreview={!!finalImage && !isLoading}
    onDownload={handleDownload}
    onRegenerate={handleGenerate}
    onReset={handleReset}
    onShare={handleShare}
  />
  </div>
)}
    </div>
  );
}