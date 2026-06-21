"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {  Check, Loader2} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Category } from "./SidebarPanels/components/CardTypeSelector";
import { type Template } from "./SidebarPanels/TemplateSidebarPanel/components/TemplateGrid";
import { TemplatePreview } from "./TemplatePreview";
import { toast } from "sonner";
import { ActionButtons } from "@/app/(dashboard)/generate/ActionButtons";
import { generateCardFilename } from "@/lib/filename";
import { downloadImage } from "@/lib/download-image";
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
  const [isSaving, setIsSaving] = useState(false);
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

  setIsSaving(true);
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


    if (!res.ok) throw new Error("save_failed");
    const data = await res.json();

    toast.success(
      <span>
        Card saved to{" "}
        <Link href="/my-cards" className="underline underline-offset-2 font-semibold text-blue-400">
          My Cards
        </Link>
      </span>
    );
    onSaved?.(data.card?.id);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      toast.error("Slow connection — save timed out. Try again?", {
        // ✅ ref use karo — direct autoSaveCard nahi
        action: { label: "Retry", onClick: () => autoSaveCardRef.current?.(image) },
      });
    } else {
      toast.error("Could not auto-save (you can still download)");
    }
  } finally {
    clearTimeout(timeoutId);
    setIsSaving(false);
  }
}, [isEditing, existingCardId, selectedTemplate, recipientName, message, nameColor, messageColor, photoUrl, photoTransform, onSaved]);// ✅ ref ko latest version pe point karo
useEffect(() => {
  autoSaveCardRef.current = autoSaveCard;
}, [autoSaveCard]);
// component unmount ya navigate away pe pending request cancel
useEffect(() => {
  return () => abortControllerRef.current?.abort();
}, []);

const handleGenerate = useCallback(async () => {
  if (!canGenerate) return;
  setIsLoading(true);
  setIsGenerated(false);
  try {
    const imageToSave = await waitForPreview();
    setIsGenerated(true);
    if (imageToSave) {
      await autoSaveCard(imageToSave);
    } else {
      toast.error("Preview image not ready, try again");
    }
  } catch {
    toast.error("Failed to process");
  } finally {
    setIsLoading(false);
  }
}, [canGenerate, autoSaveCard, waitForPreview]);


 
 const handleDownload = useCallback((format: "PNG" | "JPEG" | "PDF" = "PNG") => {
if (!finalImage) return;
if (format === "PDF") { toast.info("PDF export coming soon!"); return; }
const filename = generateCardFilename(selectedCategoryName, recipientName);
const ext = format === "JPEG" ? "jpg" : "png";
downloadImage(finalImage, `${filename}.${ext}`);
toast.success(`${format} downloaded!`);
}, [finalImage, recipientName, selectedCategoryName]);

const handleShare = useCallback(async () => {
  if (!finalImage) return;
  try {
    const res = await fetch(finalImage);
    const blob = await res.blob();
    const file = new File(
      [blob],
      generateCardFilename(selectedCategoryName, recipientName),
      { type: "image/png" }
    );
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "My Card", files: [file] });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Page link copied to clipboard!");
    }
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      toast.error("Share failed");
    }
  }
}, [finalImage, selectedCategoryName, recipientName]);


  const handleReset = useCallback(() => {
    setIsGenerated(false);
    setFinalImage(null);
    latestImageRef.current = null;
    onReset();
    toast.info("Form reset");
  }, [onReset]);

  // ✅ Clean Button Text aur Disabled State Logic (No duplicates)
  let buttonText = isEditing ? "Update Card" : "Generate Card";
let isButtonDisabled = !canGenerate || isLoading || isSaving;

if (isLoading) {
  buttonText = isEditing ? "Updating…" : "Creating…";
} else if (isSaving) {
  buttonText = "Saving…";
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
    <div className="flex flex-col gap-4 h-full">
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
        className="w-full h-10 text-sm font-semibold shadow-md transition-all bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        onClick={handleGenerate}
        disabled={isButtonDisabled}
      >
        {isLoading || isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (isGenerated && !hasChanges) ? (
          <Check className="mr-2 h-4 w-4" />
        ) : null}
        {buttonText}
      </Button>

{(isGenerated || isEditing) && (
  <ActionButtons
    hasPreview={!!finalImage && !isLoading && !isSaving}
    onDownload={handleDownload}
    onRegenerate={handleGenerate}
    onReset={handleReset}
    onShare={handleShare}
  />
)}
    </div>
  );
}