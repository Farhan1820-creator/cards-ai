import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import type { OverlayConfig } from "./OverlayConfigurator";

interface TemplateCardProps {
  template: {
    id:            string;
    name:          string;
    category:      string;
    thumbnail:     string;
    overlayConfig?: OverlayConfig | null;
  };
  onClick:   () => void;
  isAdmin?:  boolean;
  onEdit?:   () => void;
  onDelete?: () => void;
}

export function TemplateCard({ template, onClick, isAdmin = false, onEdit, onDelete }: TemplateCardProps) {
  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-muted aspect-[3/4]">
      {/* Image */}
      {template.thumbnail ? (
        <Image
          src={template.thumbnail}
          alt={template.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 ease-out"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">No preview</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

      {/* Admin buttons — top right */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/95 text-foreground shadow-sm hover:scale-110 transition-transform"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/95 text-red-500 shadow-sm hover:scale-110 transition-transform"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* User click area */}
      {!isAdmin && (
        <button
          onClick={onClick}
          className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Use ${template.name} template`}
        />
      )}

    </div>
  );
}