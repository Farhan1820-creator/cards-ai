"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  startTransition,
} from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

// CardType import sirf AI sidebar ke liye raha
import { type CardStyle } from "@/app/(dashboard)/generate/SidebarPanels/components/StyleSelector";
import { type ColorTheme } from "@/app/(dashboard)/generate/SidebarPanels/components/ColorThemeSelector";
import { type ToneType } from "@/app/(dashboard)/generate/SidebarPanels/components/CustomCardType";

import { ModeSelector, type GeneratorMode } from "@/components/ModeSelector";
import { TemplateSidebarPanel } from "@/app/(dashboard)/generate/SidebarPanels/TemplateSidebarPanel/TemplateSidebarPanel";
import { AISidebarPanel } from "@/app/(dashboard)/generate/SidebarPanels/AISidebarPanel/AiSidebarPanel";
import { TemplateCardGenerator } from "@/app/(dashboard)/generate/TemplateCardGenerator";
import { CardPreview } from "@/app/(dashboard)/generate/CardPreview";
import { ActionButtons } from "@/app/(dashboard)/generate/ActionButtons";

import { downloadImage } from "@/lib/download-image";
import { generateCardFilename } from "@/lib/filename";

import { type Template } from "@/app/(dashboard)/generate/SidebarPanels/TemplateSidebarPanel/components/TemplateGrid";


const DEFAULT_PRIMARY   = "#6D28D9";
const DEFAULT_SECONDARY = "#EC4899";
const DEFAULT_ACCENT    = "#F59E0B";
const DEFAULT_NAME_CLR  = "#ffffff";
const DEFAULT_MSG_CLR   = "#ffffff";

type InitialValues = {
  recipientName: string;
  message: string;
  nameColor: string;
  messageColor: string;
  photoUrl: string | null;
  templateId: string;
  photoTransform: { scale: number; offsetX: number; offsetY: number };
};

export interface Category {
  id: string;
  name: string;
}

interface GeneratePageContentProps {
  initialCategories: Category[];
  initialTemplates:  Template[];
}

// ─── Main content component ───────────────────────────────────────────────────
export function GeneratePageContent({
  initialCategories,
  initialTemplates,
}: GeneratePageContentProps) {
      const searchParams = useSearchParams();

  const [mode, setMode] = useState<GeneratorMode>("template");

  // ── Categories ──────────────────────────────────────────────────────────────
const [categories] = useState<Category[]>(initialCategories);
const [isLoadingCategories] = useState(false);


  // ── Template mode state ──────────────────────────────────────────────────────
  const [tmplRecipientName, setTmplRecipientName] = useState(
    searchParams.get("recipientName") ?? ""
  );
  const [tmplMessage, setTmplMessage] = useState(
    searchParams.get("message") ?? ""
  );
  const [nameColor, setNameColor] = useState(
    searchParams.get("nameColor") ?? DEFAULT_NAME_CLR
  );
  const [messageColor, setMessageColor] = useState(
    searchParams.get("messageColor") ?? DEFAULT_MSG_CLR
  );
  const [photoTransform, setPhotoTransform] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [existingCardUrl, setExistingCardUrl] = useState<string | null>(
    searchParams.get("imageUrl") ?? null
  );
  const [existingCardId, setExistingCardId] = useState<string | null>(
    searchParams.get("cardId") ?? null
  );
  const [fetchedTemplateId, setFetchedTemplateId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ── AI mode state ────────────────────────────────────────────────────────────
  const [aiCardType, setAiCardType] = useState<string>("");
  const [style, setStyle] = useState<CardStyle>("modern");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("pastel");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [customCardTitle, setCustomCardTitle] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [customTone, setCustomTone] = useState<ToneType>("friendly");
  const [includeCustomMsg, setIncludeCustomMsg] = useState(false);
  const [customMsgText, setCustomMsgText] = useState("");
  const [message, setMessage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aiRecipientName, setAiRecipientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  const initialValuesRef = useRef<InitialValues>({
    recipientName: tmplRecipientName,
    message: tmplMessage,
    nameColor,
    messageColor,
    photoUrl,
    templateId: selectedTemplate?.id ?? "",
    photoTransform: { scale: 1, offsetX: 0, offsetY: 0 },
  });

// ── selectedCategoryId — URL param se init ───────────────────
const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
  // Server pe searchParams available nahi — client pe hi resolve hoga
  // isliye lazy initializer use nahi kar sakte, useEffect mein handle karein
  return "all";
});

// URL categoryId — mount pe ek baar set karo
useEffect(() => {
  const urlCategoryId = searchParams.get("categoryId");
  if (urlCategoryId) setSelectedCategoryId(urlCategoryId);
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Card data load (editing flow) ────────────────────────────────────────
  useEffect(() => {
    const cardId = searchParams.get("cardId");
    if (!cardId) return;

    async function loadCardData() {
      try {
        const res = await fetch(`/api/user/cards/${cardId}`);
        const data = await res.json();
        const card = data.card || data;

        if (card) {
          setTmplRecipientName(card.recipientName ?? "");
          setTmplMessage(card.message ?? "");
          setNameColor(card.nameColor ?? DEFAULT_NAME_CLR);
          setMessageColor(card.messageColor ?? DEFAULT_MSG_CLR);
          setExistingCardUrl(card.imageUrl ?? null);
          setExistingCardId(card.id ?? null);
          setPhotoUrl(card.photoUrl ?? null);
          setFetchedTemplateId(card.templateId ?? null);
          setSelectedCategoryId(card.categoryId ?? "all"); 
          setPhotoTransform(
            card.photoTransform ?? { scale: 1, offsetX: 0, offsetY: 0 }
          );
          initialValuesRef.current = {
            recipientName: card.recipientName ?? "",
            message: card.message ?? "",
            nameColor: card.nameColor ?? DEFAULT_NAME_CLR,
            messageColor: card.messageColor ?? DEFAULT_MSG_CLR,
            photoUrl: card.photoUrl ?? null,
            templateId: card.templateId ?? "",
            photoTransform:
              card.photoTransform ?? { scale: 1, offsetX: 0, offsetY: 0 },
          };
        } else {
          toast.error("Card data not found!");
        }
      } catch (err) {
        console.error("Failed to load card for editing:", err);
        toast.error("Failed to load card data");
      }
    }

    loadCardData();
  }, [searchParams]);

  // ── 3. hasChanges tracker ────────────────────────────────────────────────────
  useEffect(() => {
    const init = initialValuesRef.current;
    if (!init.templateId) return;

    const currentTemplateId = selectedTemplate?.id ?? "";
    const transformChanged =
      photoTransform.scale   !== init.photoTransform.scale   ||
      photoTransform.offsetX !== init.photoTransform.offsetX ||
      photoTransform.offsetY !== init.photoTransform.offsetY;

    const isChanged =
      tmplRecipientName !== init.recipientName ||
      tmplMessage       !== init.message       ||
      nameColor         !== init.nameColor     ||
      messageColor      !== init.messageColor  ||
      photoUrl          !== init.photoUrl      ||
      currentTemplateId !== init.templateId    ||
      transformChanged;

    setHasChanges(isChanged);
  }, [
    tmplRecipientName, tmplMessage, nameColor, messageColor,
    photoUrl, selectedTemplate?.id, photoTransform, existingCardId,
  ]);

  // ── 4. Templates — selectedCategoryId change pe fetch ───────────────────────
 const initialTemplatesLoadedRef = useRef(initialTemplates.length > 0);

useEffect(() => {
  // "all" + server data already hai → skip initial fetch
  if (selectedCategoryId === "all" && initialTemplatesLoadedRef.current) return;

  async function loadTemplates() {
    try {
      setIsLoadingTemplates(true);
      const url =
        selectedCategoryId === "all"
          ? "/api/user/templates"
          : `/api/user/templates?categoryId=${selectedCategoryId}`;
      const res = await fetch(url);
      const data = await res.json();
      setTemplates(data || []);
    } catch {
      console.error("Failed to load templates");
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }
  loadTemplates();
}, [selectedCategoryId]); 

  // ── 5. Auto-select template from URL params ──────────────────────────────────
  useEffect(() => {
    if (isLoadingTemplates || templates.length === 0) return;

    const urlTemplateId = searchParams.get("templateId") ?? fetchedTemplateId ?? "";
    if (urlTemplateId) {
      const exactMatch = templates.find((t) => t.id === urlTemplateId);
      if (exactMatch) {
        startTransition(() => setSelectedTemplate(exactMatch));
      }
    }
  }, [isLoadingTemplates, templates, searchParams, fetchedTemplateId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePhotoChange = useCallback((url: string | null) => {
    if (!url || url.startsWith("data:")) { setPhotoUrl(url); return; }
    if (url.startsWith("blob:")) {
      fetch(url)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload  = () => res(reader.result as string);
              reader.onerror = rej;
              reader.readAsDataURL(blob);
            })
        )
        .then((base64) => setPhotoUrl(base64))
        .catch(() => toast.error("Photo load failed"));
      return;
    }
    setPhotoUrl(url);
  }, []);

  const handleCategoryChange = useCallback((id: string) => {
    setSelectedCategoryId(id);
    setSelectedTemplate(null);
  }, []);

  const handleTmplReset = useCallback(() => {
    setSelectedCategoryId("all");
    setSelectedTemplate(null);
    setPhotoUrl(null);
    setTmplRecipientName("");
    setMessage("");
    setTmplMessage("");
    setNameColor(DEFAULT_NAME_CLR);
    setMessageColor(DEFAULT_MSG_CLR);
    setHasChanges(false);
    setPhotoTransform({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  const handleCardSaved = useCallback(
    (savedCardId?: string, savedPhotoUrl?: string) => {
      if (savedCardId && !existingCardId) {
        setExistingCardId(savedCardId);
      }
      // Base64 photo ab Cloudinary URL se replace ho gayi — agli save/regenerate
      // pe wahi photo dobara upload nahi hogi.
      const resolvedPhotoUrl =
        savedPhotoUrl && savedPhotoUrl.startsWith("http") ? savedPhotoUrl : photoUrl;
      if (resolvedPhotoUrl !== photoUrl) setPhotoUrl(resolvedPhotoUrl);

      initialValuesRef.current = {
        recipientName: tmplRecipientName,
        message: tmplMessage,
        nameColor,
        messageColor,
        photoUrl: resolvedPhotoUrl,
        templateId: selectedTemplate?.id ?? "",
        photoTransform,
      };
      setHasChanges(false);
    },
    [
      tmplRecipientName, tmplMessage, nameColor, messageColor,
      photoUrl, selectedTemplate?.id, photoTransform, existingCardId,
    ]
  );

  const handleAiGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/cards/generate/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardType: aiCardType,
          recipientName: aiRecipientName,
          message,
          style, colorTheme, primaryColor, secondaryColor, accentColor,
          prompt, customCardTitle, customOccasion,
          tone: customTone,
          includeCustomMessage: includeCustomMsg,
          customMessageText: customMsgText,
        }),
      });
      const data = await res.json();
      if (!data.success) { toast.error("Generation failed!"); throw new Error(); }
      setPreviewUrl(data.card.imageUrl);
      toast.success("Card generated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiDownload = (format: "PNG" | "JPEG" | "PDF") => {
    if (!previewUrl) return;
    const filename = generateCardFilename(aiCardType, aiRecipientName);
    if (format === "PDF") { toast.info("PDF export coming soon!"); return; }
    const ext = format === "JPEG" ? "jpg" : "png";
    downloadImage(previewUrl, `${filename}.${ext}`);
    toast.success(`${format} downloaded!`);
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    if (navigator.share) {
      try { await navigator.share({ title: "My Card", url: previewUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(previewUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAiRegenerate = () => handleAiGenerate();

  const handleAiReset = () => {
    setAiCardType("birthday");
    setStyle("modern");
    setColorTheme("pastel");
    setPrompt("");
    setPreviewUrl(undefined);
    setPrimaryColor(DEFAULT_PRIMARY);
    setSecondaryColor(DEFAULT_SECONDARY);
    setAccentColor(DEFAULT_ACCENT);
    setCustomCardTitle("");
    setCustomOccasion("");
    setCustomTone("friendly");
    setIncludeCustomMsg(false);
    setCustomMsgText("");
    setAiRecipientName("");
  };

  const canGenerate = prompt.trim().length > 0;

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#f8f7ff]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-white px-4 py-3 shadow-sm shrink-0 sm:px-6 sm:py-4">
        <div>
          <h1 className="text-lg font-bold leading-none text-primary sm:text-2xl">
            Lets create amazing cards
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Create beautiful greeting cards in seconds
          </p>
        </div>
        <div className="ml-auto">
          <ModeSelector mode={mode} onModeChange={setMode} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
    <aside className="
  w-full shrink-0 overflow-y-auto border-b border-border bg-white px-3 py-3
  md:w-1/3 md:border-b-0 md:border-r md:py-4
  max-h-[45vh] md:max-h-none
">
          {mode === "template" ? (
            <TemplateSidebarPanel
              // category props — updated
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
              // rest same
              templates={templates}
              isTempLoading={isLoadingTemplates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              recipientName={tmplRecipientName}
              onRecipientNameChange={setTmplRecipientName}
              message={tmplMessage}
              onMessageChange={setTmplMessage}
              nameColor={nameColor}
              onNameColorChange={setNameColor}
              messageColor={messageColor}
              onMessageColorChange={setMessageColor}
              photoUrl={photoUrl}
              onPhotoChange={handlePhotoChange}
              isEditing={!!existingCardId}
            />
          ) : (
  <AISidebarPanel
  categories={categories}
  selectedCategoryId={selectedCategoryId}
  onCategoryChange={handleCategoryChange}
  isLoadingCategories={isLoadingCategories}              
              style={style}
              onStyleChange={setStyle}
              colorTheme={colorTheme}
              onColorThemeChange={setColorTheme}
              primaryColor={primaryColor}
              onPrimaryColorChange={setPrimaryColor}
              secondaryColor={secondaryColor}
              onSecondaryColorChange={setSecondaryColor}
              accentColor={accentColor}
              onAccentColorChange={setAccentColor}
              customCardTitle={customCardTitle}
              onCustomCardTitleChange={setCustomCardTitle}
              customOccasion={customOccasion}
              onCustomOccasionChange={setCustomOccasion}
              customTone={customTone}
              onCustomToneChange={setCustomTone}
              includeCustomMessage={includeCustomMsg}
              onIncludeCustomMessageChange={setIncludeCustomMsg}
              customMessageText={customMsgText}
              onCustomMessageTextChange={setCustomMsgText}
              prompt={prompt}
              onPromptChange={setPrompt}
              recipientName={aiRecipientName}
              onRecipientNameChange={setAiRecipientName}
            />
          )}
        </aside>

        <main className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-4 py-4 gap-4 sm:px-8 sm:py-6">
          {mode === "template" ? (
            <div className="w-full max-w-lg">
              <TemplateCardGenerator
                categories={categories}
                selectedCategoryId={selectedCategoryId} 
                selectedTemplate={selectedTemplate}
                photoUrl={photoUrl}
                onRemovePhoto={() => setPhotoUrl(null)}
                recipientName={tmplRecipientName}
                message={tmplMessage}
                nameColor={nameColor}
                messageColor={messageColor}
                onReset={handleTmplReset}
                existingCardUrl={existingCardUrl}
                existingCardId={existingCardId}
                isEditing={!!existingCardId}
                hasChanges={hasChanges}
                onSaved={handleCardSaved}
                onExistingCardDismiss={() => {
                  setExistingCardUrl(null);
                  setExistingCardId(null);
                }}
                photoTransform={photoTransform}
                onTransformChange={setPhotoTransform}
              />
            </div>
          ) : (
            <div className="w-full max-w-lg space-y-4">
              <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                <CardPreview imageUrl={previewUrl} isLoading={isLoading} />
              </div>
              <Button
                size="lg"
                className="w-full h-11 text-sm font-semibold shadow-md bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0"
                disabled={!canGenerate || isLoading}
                onClick={handleAiGenerate}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Generate Card"}
              </Button>
              <ActionButtons
                hasPreview={!!previewUrl}
                onDownload={handleAiDownload}
                onRegenerate={handleAiRegenerate}
                onReset={handleAiReset}
                onShare={handleShare}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}