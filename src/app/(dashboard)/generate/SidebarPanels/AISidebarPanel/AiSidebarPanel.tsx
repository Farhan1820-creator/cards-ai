"use client";

import { CardTypeSelector, type Category } from "../components/CardTypeSelector";
import { StyleSelector, type CardStyle } from "../components/StyleSelector";
import { ColorThemeSelector, type ColorTheme } from "../components/ColorThemeSelector";
import { CustomColorPicker } from "../components/CustomColorPicker";
import { CustomCardType, type ToneType } from "../components/CustomCardType";
import { CustomMessageText } from "./components/CustomMessageText";
import { PromptInput } from "./components/PromptInput";
import { RecipientNameInput } from "./components/RecipientNameInput";

interface AISidebarPanelProps {
  categories: Category[];
selectedCategoryId: string;
onCategoryChange: (id: string) => void;
isLoadingCategories?: boolean;
  style: CardStyle;
  onStyleChange: (v: CardStyle) => void;
  colorTheme: ColorTheme;
  onColorThemeChange: (v: ColorTheme) => void;
  primaryColor: string;
  onPrimaryColorChange: (v: string) => void;
  secondaryColor: string;
  onSecondaryColorChange: (v: string) => void;
  accentColor: string;
  onAccentColorChange: (v: string) => void;
  customCardTitle: string;
  onCustomCardTitleChange: (v: string) => void;
  customOccasion: string;
  onCustomOccasionChange: (v: string) => void;
  customTone: ToneType;
  onCustomToneChange: (v: ToneType) => void;
  includeCustomMessage: boolean;
  onIncludeCustomMessageChange: (v: boolean) => void;
  customMessageText: string;
  onCustomMessageTextChange: (v: string) => void;
  prompt: string;
  onPromptChange: (v: string) => void;
  recipientName: string;
  onRecipientNameChange: (v: string) => void;
}

export function AISidebarPanel({

  categories,
 selectedCategoryId,
 onCategoryChange,
 isLoadingCategories,
  style, onStyleChange,
  colorTheme, onColorThemeChange,
  primaryColor, onPrimaryColorChange,
  secondaryColor, onSecondaryColorChange,
  accentColor, onAccentColorChange,
  customCardTitle, onCustomCardTitleChange,
  customOccasion, onCustomOccasionChange,
  customTone, onCustomToneChange,
  includeCustomMessage, onIncludeCustomMessageChange,
  customMessageText, onCustomMessageTextChange,
  prompt, onPromptChange,
  recipientName, onRecipientNameChange,
}: AISidebarPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-0.5">

      {/* Card Type */}
      <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Card Type
        </p>
<CardTypeSelector
  categories={categories}
  selected={selectedCategoryId}
  onSelect={onCategoryChange}
  isLoading={isLoadingCategories}
/>

        {selectedCategoryId === "custom" && (
          <>
            <div className="h-px bg-border/50" />
            <CustomCardType
              cardTitle={customCardTitle}
              occasionDescription={customOccasion}
              tone={customTone}
              includeCustomMessage={includeCustomMessage}
              onCardTitleChange={onCustomCardTitleChange}
              onOccasionDescriptionChange={onCustomOccasionChange}
              onToneChange={onCustomToneChange}
              onIncludeCustomMessageChange={onIncludeCustomMessageChange}
            />
          </>
        )}
      </div>

      {/* Recipient + Prompt */}
      <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Details
        </p>
        <RecipientNameInput value={recipientName} onChange={onRecipientNameChange} />
        <PromptInput value={prompt} onChange={onPromptChange} />
      </div>

      {/* Custom Message */}
      <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Message
        </p>
        <CustomMessageText
          enabled={includeCustomMessage}
          message={customMessageText}
          onToggle={onIncludeCustomMessageChange}
          onMessageChange={onCustomMessageTextChange}
        />
      </div>

      {/* Style */}
      <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Style
        </p>
        <StyleSelector selected={style} onSelect={onStyleChange} />
      </div>

      {/* Color Theme */}
      <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Color Theme
        </p>
        <ColorThemeSelector selected={colorTheme} onSelect={onColorThemeChange} />
        {colorTheme === "custom" && (
          <>
            <div className="h-px bg-border/50" />
            <CustomColorPicker
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              onPrimaryChange={onPrimaryColorChange}
              onSecondaryChange={onSecondaryColorChange}
              onAccentChange={onAccentColorChange}
            />
          </>
        )}
      </div>
    </div>
  );
}