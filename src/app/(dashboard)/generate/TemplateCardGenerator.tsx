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
  onSaved?: (cardId?: string, photoUrl?: string) => void;
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

const MAX_SAVE_BYTES = 5 * 1024 * 1024;

const handlePreviewReady = useCallback((dataUrl: string) => {
  setFinalImage(dataUrl);
  latestImageRef.current = dataUrl;
}, []);

const autoSaveCard = useCallback(async (image: string) => {
  if (!selectedTemplate || !image) return;

  const approxBytes = (image.length * 3) / 4;
  if (approxBytes > MAX_SAVE_BYTES) {
    toast.warning("Could not save card due to large upload image size. You can still download it.", { duration: 6000 });
    return;
  }

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
    });

    if (!res.ok) throw new Error("save_failed");
    const data: { card?: { id?: string; photoUrl?: string | null } } = await res.json();

    toast.success(
      <span>
        Card saved to{" "}
        <Link href="/my-cards" className="underline underline-offset-2 font-semibold text-blue-400">
          My Cards
        </Link>
      </span>
    );
    onSaved?.(data.card?.id, data.card?.photoUrl ?? undefined);
  } catch {
    toast.error("Could not auto-save (you can still download)");
  } finally {
    setIsSaving(false);
  }
}, [isEditing, existingCardId, selectedTemplate, recipientName, message, nameColor, messageColor, photoUrl, photoTransform, onSaved, MAX_SAVE_BYTES]);

const [pendingGenerate, setPendingGenerate] = useState(false);

const handleGenerate = useCallback(() => {
  if (!canGenerate || isLoading) return;
  setIsGenerated(false);
  setIsLoading(true);
  setPendingGenerate(true);   // bas flag set karo, baaki effect sambhalega
}, [canGenerate, isLoading]);

// Jab bhi preview ready ho aur generate pending ho, auto-save karo
useEffect(() => {
  if (!pendingGenerate || !finalImage) return;

  setPendingGenerate(false);
  setIsGenerated(true);
  autoSaveCard(finalImage).finally(() => setIsLoading(false));
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
        {isLoading || isSaving ? (
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
        disabled={!finalImage || isLoading || isSaving}
        onClick={() => {
          window.location.href = "/generate";
        }}
      >
        New Card
      </Button>

  <ActionButtons
    hasPreview={!!finalImage && !isLoading && !isSaving}
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