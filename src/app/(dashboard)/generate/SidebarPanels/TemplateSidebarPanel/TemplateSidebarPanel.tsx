"use client";

import { useMemo } from "react";
import { LayoutGrid, Type, Image as ImageIcon } from "lucide-react";

import { TabbedSidebarLayout } from "@/app/(dashboard)/generate/SidebarPanels/TabbedSidebarLayout";
import { type Category } from "@/app/(dashboard)/generate/page";
import { type Template } from "./components/TemplateGrid";
import { TemplatesTabContent } from "./components/TemplatesTabContent";
import { PersonalizeTabContent } from "./components/PersonalizeTabContent";
import { PhotoTabContent } from "./components/PhotoTabContent";

interface TemplateSidebarPanelProps {
  categories: Category[];
  isLoadingCategories: boolean;
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  templates: Template[];
  isTempLoading: boolean;
  selectedTemplate: Template | null;
  onTemplateSelect: (t: Template | null) => void;
  recipientName: string;
  onRecipientNameChange: (v: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
  nameColor: string;
  onNameColorChange: (v: string) => void;
  messageColor: string;
  onMessageColorChange: (v: string) => void;
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  isEditing?: boolean;
}

export function TemplateSidebarPanel({
  categories, isLoadingCategories, selectedCategoryId, onCategoryChange,
  templates, isTempLoading, selectedTemplate, onTemplateSelect,
  recipientName, onRecipientNameChange,
  message, onMessageChange,
  nameColor, onNameColorChange,
  messageColor, onMessageColorChange,
  photoUrl, onPhotoChange,
}: TemplateSidebarPanelProps) {
  const templateChosen = selectedTemplate !== null;

  // ── Progress calculation ─────────────────────────────────────
  // 4 fields: template, recipientName, message, photo
  // photo is optional so weight it less — template(35) + name(25) + message(25) + photo(15)
  const progress = useMemo(() => {
    let score = 0;
    if (templateChosen)               score += 35;
    if (recipientName.trim().length)  score += 25;
    if (message.trim().length)        score += 25;
    if (photoUrl)                     score += 15;
    return score;
  }, [templateChosen, recipientName, message, photoUrl]);

  const tabs = useMemo(
    () => [
      {
        id: "templates",
        label: "Templates",
        icon: LayoutGrid,
        content: (
          <TemplatesTabContent
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={onCategoryChange}
            isLoading={isTempLoading}
            templates={templates}
            selectedId={selectedTemplate?.id ?? null}
            onSelect={onTemplateSelect}
          />
        ),
      },
      {
        id: "personalize",
        label: "Personalize",
        icon: Type,
        content: (
          <PersonalizeTabContent
            templateChosen={templateChosen}
            recipientName={recipientName}
            onRecipientNameChange={onRecipientNameChange}
            nameColor={nameColor}
            onNameColorChange={onNameColorChange}
            message={message}
            onMessageChange={onMessageChange}
            messageColor={messageColor}
            onMessageColorChange={onMessageColorChange}
          />
        ),
      },
      {
        id: "photo",
        label: "Photo",
        icon: ImageIcon,
        content: (
          <PhotoTabContent
            templateChosen={templateChosen}
            photoUrl={photoUrl}
            onPhotoChange={onPhotoChange}
          />
        ),
      },
    ],
    [
      categories, isLoadingCategories, selectedCategoryId, onCategoryChange,
      isTempLoading, templates, selectedTemplate?.id, onTemplateSelect,
      templateChosen, recipientName, onRecipientNameChange,
      nameColor, onNameColorChange, message, onMessageChange,
      messageColor, onMessageColorChange, photoUrl, onPhotoChange,
    ]
  );

  return <TabbedSidebarLayout tabs={tabs} progress={progress} />;
}