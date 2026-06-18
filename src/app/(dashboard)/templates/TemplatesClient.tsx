"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Cake, Heart, Calendar, Mail, Plus,SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/template";
import { useTemplates, CATEGORIES, FilterCategory } from "./hooks/useTemplates";
import { TemplateCard } from "./TemplateCard";
import { TemplateDialog } from "./TemplateDialog";
import { AdminTemplateDialog, type AdminTemplateDialogData } from "./AdminTemplateDialog";
import type { OverlayConfig } from "./OverlayConfigurator";

// ── Types ─────────────────────────────────────────────────────
interface AdminTemplate {
  id:            string;
  title:         string;
  category:      string;
  imageUrl:      string | null;
  createdAt:     Date | null;
  overlayConfig: OverlayConfig | null;
}

interface TemplatesClientProps {
  isAdmin?:          boolean;
  initialTemplates?: AdminTemplate[] | null;
}

const CATEGORY_META: Record<FilterCategory, { label: string; icon: React.ElementType }> = {
  birthday:    { label: "Birthday",    icon: Cake     },
  wedding:     { label: "Wedding",     icon: Heart    },
  anniversary: { label: "Anniversary", icon: Calendar },
  invitation:  { label: "Invitation",  icon: Mail     },
};

// ── Admin API helpers ─────────────────────────────────────────
async function apiCreateTemplate(data: AdminTemplateDialogData) {
  const res = await fetch("/api/admin/templates", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

async function apiUpdateTemplate(id: string, data: AdminTemplateDialogData) {
  const res = await fetch("/api/admin/templates", {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

async function apiDeleteTemplate(id: string) {
  const res = await fetch("/api/admin/templates", {
    method:  "DELETE",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Delete failed");
}

async function apiFetchAllTemplates(): Promise<AdminTemplate[]> {
  const res  = await fetch("/api/admin/templates");
  const data = await res.json();
  return (data.templates ?? []).map((t: {
    id: string; name: string; category: string;
    thumbnailUrl?: string | null; imageUrl?: string | null;
    createdAt?: string | null; overlayConfig?: OverlayConfig | null;
  }) => ({
    id:            t.id,
    title:         t.name,
    category:      t.category,
    imageUrl:      t.thumbnailUrl ?? t.imageUrl ?? null,
    createdAt:     t.createdAt ? new Date(t.createdAt) : null,
    overlayConfig: t.overlayConfig ?? null,
  }));
}

// ── Delete Dialog ─────────────────────────────────────────────
function DeleteDialog({ open, title, onConfirm, onCancel }: {
  open: boolean; title: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Template?</h3>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-700">&apos{title}&apos</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function TemplatesClient({ isAdmin = false, initialTemplates = null }: TemplatesClientProps) {
  // ── User state ──────────────────────────────────────────────
  const {
    templates,
    isLoading,
    error,
    category,
    setCategory,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    total,
  } = useTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userFiltersOpen, setUserFiltersOpen] = useState(false);

  // ── Admin state ─────────────────────────────────────────────
  const [adminTemplates,  setAdminTemplates]  = useState<AdminTemplate[]>(initialTemplates ?? []);
  const [adminSearch,     setAdminSearch]     = useState("");
  const [adminFilterCat,  setAdminFilterCat]  = useState<string>("all");
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplate | null>(null);
  const [deleteTarget,    setDeleteTarget]    = useState<AdminTemplate | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [adminFiltersOpen, setAdminFiltersOpen] = useState(false);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAdminSave(data: AdminTemplateDialogData) {
    try {
      if (editingTemplate) {
        await apiUpdateTemplate(editingTemplate.id, data);
        showToast("Template updated!");
      } else {
        await apiCreateTemplate(data);
        showToast("Template created!");
      }
      const updated = await apiFetchAllTemplates();
      setAdminTemplates(updated);
      setEditingTemplate(null);
    } catch {
      showToast("Something went wrong.", "error");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await apiDeleteTemplate(deleteTarget.id);
      setAdminTemplates((ts) => ts.filter((t) => t.id !== deleteTarget.id));
      showToast("Template deleted.");
    } catch {
      showToast("Delete failed.", "error");
    }
    setDeleteTarget(null);
  }

  // ── Admin filtered templates ─────────────────────────────────
  const adminFiltered = adminTemplates.filter((t) => {
    const matchCat    = adminFilterCat === "all" || t.category === adminFilterCat;
    const matchSearch = t.title.toLowerCase().includes(adminSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Toast */}
      {isAdmin && toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}

      {/* ── Header row — Create button for admin ── */}
      {isAdmin && (
        <div className="flex items-center justify-end">
          <Button
            onClick={() => { setEditingTemplate(null); setAdminDialogOpen(true); }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      )}

{/* ── Filter Bar ── */}
<div className="flex flex-col items-center gap-3 mb-6 w-full">

  {/* Row 1: Search + mobile toggle */}
  <div className="flex items-center gap-2 w-full max-w-lg">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search templates..."
        value={isAdmin ? adminSearch : search}
        onChange={(e) => isAdmin ? setAdminSearch(e.target.value) : setSearch(e.target.value)}
        className="pl-9 bg-white rounded-xl h-9 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>

    {/* Mobile: filter toggle */}
    <button
      onClick={() => isAdmin
        ? setAdminFiltersOpen((v) => !v)
        : setUserFiltersOpen((v) => !v)
      }
      className={`sm:hidden flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors ${
        (isAdmin ? adminFiltersOpen : userFiltersOpen) ||
        (isAdmin ? adminFilterCat !== "all" : !!category)
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      <SlidersHorizontal className="h-3.5 w-3.5" />
      Filters
      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
        (isAdmin ? adminFiltersOpen : userFiltersOpen) ? "rotate-180" : ""
      }`} />
    </button>
  </div>

  {/* Row 2: Category pills — collapsible on mobile */}
  <div className={`w-full flex justify-center overflow-hidden transition-all duration-300 ease-in-out ${
    (isAdmin ? adminFiltersOpen : userFiltersOpen)
      ? "max-h-40 opacity-100"
      : "max-h-0 opacity-0 sm:max-h-40 sm:opacity-100"
  }`}>
    <div className="flex flex-wrap justify-center gap-2 pt-1 pb-0.5 px-1">
      {isAdmin && (
        <Button
          variant={adminFilterCat === "all" ? "pill-active" : "pill"}
          size="sm"
          onClick={() => setAdminFilterCat("all")}
        >
          All
        </Button>
      )}
      {CATEGORIES.map((cat) => {
        const { label, icon: Icon } = CATEGORY_META[cat];
        const isActive = isAdmin ? adminFilterCat === cat : category === cat;
        return (
          <Button
            key={cat}
            variant={isActive ? "pill-active" : "pill"}
            size="sm"
            onClick={() => isAdmin ? setAdminFilterCat(cat) : setCategory(cat)}
            className="gap-1.5"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        );
      })}
    </div>
  </div>
</div>

      {/* ── Error (user only) ── */}
      {!isAdmin && error && <p className="text-sm text-destructive">{error}</p>}

      {/* ── Grid ── */}
      {isAdmin ? (
        // Admin grid
        adminFiltered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            {adminSearch ? `No results for "${adminSearch}"` : "No templates yet. Create one!"}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{adminFiltered.length} templates</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {adminFiltered.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={{
                    id:        t.id,
                    name:      t.title,
                    category:  t.category,
                    thumbnail: t.imageUrl ?? "",
                    overlayConfig: t.overlayConfig,
                  }}
                  onClick={() => {}} // admin card pe click se kuch nahi
                  isAdmin={true}
                  onEdit={() => { setEditingTemplate(t); setAdminDialogOpen(true); }}
                  onDelete={() => setDeleteTarget(t)}
                />
              ))}
            </div>
          </>
        )
      ) : (
        // User grid
        isLoading ? (
          <TemplateGridSkeleton />
        ) : templates.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{total} templates found</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          </>
        )
      )}

      {/* ── Pagination (user only) ── */}
      {!isAdmin && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* ── User template preview dialog ── */}
      <TemplateDialog
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />

      {/* ── Admin create/edit dialog ── */}
      {isAdmin && (
        <AdminTemplateDialog
          open={adminDialogOpen}
          onClose={() => { setAdminDialogOpen(false); setEditingTemplate(null); }}
          onSave={handleAdminSave}
          editing={editingTemplate}
        />
      )}

      {/* ── Admin delete confirm ── */}
      {isAdmin && (
        <DeleteDialog
          open={!!deleteTarget}
          title={deleteTarget?.title ?? ""}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function TemplateGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="py-16 text-center text-muted-foreground">
      {search
        ? <p>No templates found for &quot;{search}&quot;</p>
        : <p>No templates in this category yet.</p>
      }
    </div>
  );
}