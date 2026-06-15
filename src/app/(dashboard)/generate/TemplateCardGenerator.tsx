"use client";

import { useState, useCallback, useRef } from "react";
import {  Check, Loader2} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CardType } from "./SidebarPanels/components/CardTypeSelector";
import { type Template } from "./SidebarPanels/TemplateSidebarPanel/components/TemplateGrid";
import { TemplatePreview } from "./TemplatePreview";
import { toast } from "sonner";
import { ActionButtons } from "@/app/(dashboard)/generate/ActionButtons";
import { generateCardFilename } from "@/lib/filename";
import { downloadImage } from "@/lib/download-image";
import Link from "next/link";


interface TemplateCardGeneratorProps {
  cardType: CardType;
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
  cardType,
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

  const templateChosen = selectedTemplate !== null;
const canGenerate = templateChosen; 
  const handlePreviewReady = useCallback((dataUrl: string) => {
    setFinalImage(dataUrl);
    latestImageRef.current = dataUrl;
  }, []);

const autoSaveCard = useCallback(async (image: string) => {
  if (!selectedTemplate || !image) return;
  setIsSaving(true);
  try {
    const url = isEditing ? `/api/user/cards/${existingCardId}` : "/api/user/cards/generate/template";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image, cardType, recipientName, message,
        nameColor, messageColor, photoUrl,
        templateId: selectedTemplate.id,
        photoTransform,
      }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();

    toast.success(
      <span>
        Card saved to{" "}
        <Link href="/my-cards" className="underline underline-offset-2 font-semibold text-blue-400">
          My Cards
        </Link>
      </span>
    );
    onSaved?.(data.card?.id); // ← DB se aai reliable id
  } catch {
    toast.error("Could not auto-save (you can still download)");
  } finally {
    setIsSaving(false);
  }
}, [isEditing, existingCardId, selectedTemplate, cardType, recipientName, message, nameColor, messageColor, photoUrl, photoTransform, onSaved]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    setIsGenerated(false);
    
    try {
      await new Promise((r) => setTimeout(r, 1200)); // Simulated generation delay
      setIsGenerated(true);

      const imageToSave = latestImageRef.current;
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
  }, [canGenerate, autoSaveCard]);

 const handleDownload = useCallback((format: "PNG" | "JPEG" | "PDF" = "PNG") => {
if (!finalImage) return;
if (format === "PDF") { toast.info("PDF export coming soon!"); return; }
const filename = generateCardFilename(cardType, recipientName);
const ext = format === "JPEG" ? "jpg" : "png";
downloadImage(finalImage, `${filename}.${ext}`);
toast.success(`${format} downloaded!`);
}, [finalImage, recipientName, cardType]);

const handleShare = useCallback(async () => {
  if (!finalImage) return;

  try {
    // base64 → Blob → File
    const res = await fetch(finalImage);
    const blob = await res.blob();
    const file = new File([blob], `${generateCardFilename(cardType, recipientName)}.png`, {
      type: "image/png",
    });

    // File share support check karo
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "My Card",
        files: [file],
      });
    } else {
      // Fallback: clipboard pe copy karo
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Page link copied to clipboard!");
    }
  } catch (err) {
    // User ne cancel kiya to ignore karo
    if (err instanceof Error && err.name !== "AbortError") {
      toast.error("Share failed");
    }
  }
}, [finalImage, cardType, recipientName]);

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