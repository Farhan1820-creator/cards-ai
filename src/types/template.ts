import type { CardType } from "@/app/(dashboard)/generate/SidebarPanels/components/CardTypeSelector";
import type { OverlayConfig } from "@/app/(dashboard)/templates/OverlayConfigurator";

export interface Template {
  id:            string;
  name:          string;
  thumbnail:     string;
  category:      Exclude<CardType, "custom">;
  overlayConfig?: OverlayConfig;
}