import type { OverlayConfig } from "@/app/(dashboard)/templates/OverlayConfigurator";

export interface Template {
  id:             string;
  name:           string;
  imageUrl:       string;
  categoryId?:    string;  
  category:      string;   
  overlayConfig?: OverlayConfig;
}