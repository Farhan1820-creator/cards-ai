import Image from "next/image";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OverlayConfig } from "./OverlayConfigurator";

interface TemplateCardProps {
  template: {
    id:             string;
    name:           string;
    category:       string;
    imageUrl:      string;
    overlayConfig?: OverlayConfig | null;
  };
  onClick:    () => void;
  isAdmin?:   boolean;
  isDeleting?: boolean;        // parent se controlled — animation trigger
  onEdit?:    () => void;
  onDelete?:  () => void;
}

export function TemplateCard({
  template, onClick, isAdmin = false, isDeleting = false, onEdit, onDelete,
}: TemplateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Outside click pe dropdown band ho jaye
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete?.();
  }, [onDelete]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.();
  }, [onEdit]);

  return (
    <div
      className={`
        group relative w-full overflow-hidden rounded-xl bg-muted aspect-[3/4]
        transition-all duration-300 ease-in-out origin-center
        ${isDeleting ? "scale-75 opacity-0 pointer-events-none" : "scale-100 opacity-100"}
      `}
    >
      {/* Image */}
      {template.imageUrl ? (
        <Image
          src={template.imageUrl}
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

      {/* Delete ripple — animation ke dauran */}
      {isDeleting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-500/20 animate-pulse">
          <Trash2 className="w-8 h-8 text-red-500 drop-shadow" />
        </div>
      )}

      {/* Admin kebab menu — always visible (touch-safe), click pe dropdown */}
      {isAdmin && !isDeleting && (
        <div ref={menuRef} className="absolute top-2 right-2 z-20">
          <button
            onClick={toggleMenu}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/95 text-foreground shadow-sm hover:scale-110 transition-transform"
            title="Options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1.5 w-32 rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden"
            >
              <button
                role="menuitem"
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                role="menuitem"
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
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