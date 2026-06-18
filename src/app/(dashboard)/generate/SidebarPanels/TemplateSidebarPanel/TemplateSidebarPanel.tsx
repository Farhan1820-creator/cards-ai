"use client";

import { useMemo } from "react";
import { LayoutGrid, Type, Image as ImageIcon } from "lucide-react";

import { TabbedSidebarLayout } from "@/app/(dashboard)/generate/SidebarPanels/TabbedSidebarLayout";
import { type CardType } from "../components/CardTypeSelector";
import { type Template } from "./components/TemplateGrid";
import { TemplatesTabContent } from "./components/TemplatesTabContent";
import { PersonalizeTabContent } from "./components/PersonalizeTabContent";
import { PhotoTabContent } from "./components/PhotoTabContent";

interface TemplateSidebarPanelProps {
  cardType: CardType;
  onCardTypeChange: (t: CardType) => void;
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
  cardType, onCardTypeChange,
  templates, isTempLoading, selectedTemplate, onTemplateSelect,
  recipientName, onRecipientNameChange,
  message, onMessageChange,
  nameColor, onNameColorChange,
  messageColor, onMessageColorChange,
  photoUrl, onPhotoChange,
}: TemplateSidebarPanelProps) {
  const templateChosen = selectedTemplate !== null;

  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.category.toLowerCase().trim() === cardType.toLowerCase().trim()),
    [templates, cardType]
  );

  const tabs = useMemo(
    () => [
      {
        id: "templates",
        label: "Templates",
        icon: LayoutGrid,
        content: (
          <TemplatesTabContent
            cardType={cardType}
            onCardTypeChange={onCardTypeChange}
            isLoading={isTempLoading}
            templates={filteredTemplates}
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
      cardType, onCardTypeChange, isTempLoading, filteredTemplates,
      selectedTemplate?.id, onTemplateSelect, templateChosen,
      recipientName, onRecipientNameChange, nameColor, onNameColorChange,
      message, onMessageChange, messageColor, onMessageColorChange,
      photoUrl, onPhotoChange,
    ]
  );

  return <TabbedSidebarLayout tabs={tabs} />;
}