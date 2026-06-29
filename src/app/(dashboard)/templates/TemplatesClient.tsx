"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, Plus, SlidersHorizontal, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Template } from "@/types/template";
import { useTemplates } from "./hooks/useTemplates";
import { TemplateCard } from "./TemplateCard";
import { TemplateDialog } from "./TemplateDialog";
import { AdminTemplateDialog, type AdminTemplateDialogData } from "./AdminTemplateDialog";
import type { OverlayConfig } from "./OverlayConfigurator";

// ── Types ──────────────────────────────────────────────────────
interface AdminTemplate {
  id:            string;
  title:         string;
  categoryId:    string;
  category:      string;
  imageUrl:      string | null;
  createdAt:     Date | null;
  overlayConfig: OverlayConfig | null;
}

interface TemplatesClientProps {
  isAdmin?:          boolean;
  initialTemplates?:     AdminTemplate[] | null;      // admin ke liye (existing)
  initialUserTemplates?: Template[] | null;           // non-admin ke liye (new)
  initialCategories?:    { id: string; name: string }[] | null;}

// ── API helpers ────────────────────────────────────────────────
// Raw template shape jo server return karta hai
interface RawTemplate {
  id:             string;
  name:           string;
  categoryId:     string;
  category:       string;
  imageUrl?:      string | null;
  createdAt?:     string | null;
  overlayConfig?: OverlayConfig | null;
}

function normaliseTemplate(t: RawTemplate): AdminTemplate {
  return {
    id:            t.id,
    title:         t.name,
    categoryId:    t.categoryId,
    category:      t.category,
    imageUrl:      t.imageUrl ?? null,
    createdAt:     t.createdAt ? new Date(t.createdAt) : null,
    overlayConfig: t.overlayConfig ?? null,
  };
}

async function apiCreateTemplate(data: AdminTemplateDialogData): Promise<AdminTemplate> {
  const res = await fetch("/api/admin/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  const json = await res.json();
  return normaliseTemplate(json.template ?? json);
}

async function apiUpdateTemplate(id: string, data: AdminTemplateDialogData): Promise<AdminTemplate> {
  const res = await fetch("/api/admin/templates", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error("Update failed");
  const json = await res.json();
  return normaliseTemplate(json.template ?? json);
}

async function apiDeleteTemplate(id: string): Promise<void> {
  const res = await fetch("/api/admin/templates", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Delete failed");
}

// ANIMATION_MS: TemplateCard ke isDeleting CSS animation duration se match karo
const ANIMATION_MS = 400;

// ── Main Component ─────────────────────────────────────────────
export function TemplatesClient({
  isAdmin = false,
  initialTemplates = null,
  initialUserTemplates,   // ← add
  initialCategories,      // ← add
}: TemplatesClientProps) {

  // ── User (non-admin) state ─────────────────────────────────────
const {
    templates, isLoading, error,
    categories,
    category, setCategory,
    search, setSearch,
    page, setPage,
    totalPages, total,
  } = useTemplates({
    initialTemplates:  initialUserTemplates ?? undefined,  // ← add
    initialCategories: initialCategories    ?? undefined,  // ← add
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userFiltersOpen,  setUserFiltersOpen]  = useState(false);

  // ── Admin state ────────────────────────────────────────────────
  const [adminTemplates,   setAdminTemplates]   = useState<AdminTemplate[]>(initialTemplates ?? []);
  const [adminSearch,      setAdminSearch]       = useState("");
  const [adminFilterCat,   setAdminFilterCat]   = useState<string>("all");
  const [adminDialogOpen,  setAdminDialogOpen]  = useState(false);
  const [editingTemplate,  setEditingTemplate]  = useState<AdminTemplate | null>(null);
  const [adminFiltersOpen, setAdminFiltersOpen] = useState(false);

  // deleteTarget: dialog ke liye; deletingId: animation ke liye
  const [deleteTarget, setDeleteTarget] = useState<AdminTemplate | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);

  // Admin filter pills ke liye categories — adminTemplates se hi unique
  // {id, name} pairs derive kar lo, koi extra fetch nahi chahiye.
  const adminCategories = useMemo<{ id: string; name: string }[]>(() => {
    const map = new Map<string, string>();
    adminTemplates.forEach((t) => {
      if (t.categoryId && !map.has(t.categoryId)) map.set(t.categoryId, t.category);
    });
    return [{ id: "all", name: "All" }, ...Array.from(map, ([id, name]) => ({ id, name }))];
  }, [adminTemplates]);

  const visibleCategories = isAdmin ? adminCategories : categories;

  // ── Admin: Save (create / edit) ────────────────────────────────
  const handleAdminSave = useCallback(async (data: AdminTemplateDialogData) => {
    try {
      if (editingTemplate) {
        const updated = await apiUpdateTemplate(editingTemplate.id, data);
        setAdminTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        toast.success("Template updated!");
      } else {
        const created = await apiCreateTemplate(data);
        setAdminTemplates((prev) => [created, ...prev]);
        toast.success("Template created!");
      }
      setAdminDialogOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [editingTemplate]);

  // ── Admin: Delete flow ─────────────────────────────────────────
  const handleDeleteRequest = useCallback((t: AdminTemplate) => {
    setDeleteTarget(t);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;

    setDeleteTarget(null);
    setDeletingId(target.id);

    await new Promise<void>((resolve) => setTimeout(resolve, ANIMATION_MS));

    setAdminTemplates((prev) => prev.filter((t) => t.id !== target.id));
    setDeletingId(null);

    try {
      await apiDeleteTemplate(target.id);
      toast.success("Template deleted.");
    } catch {
      setAdminTemplates((prev) => [target, ...prev]);
      toast.error("Delete failed — template restored.");
    }
  }, [deleteTarget]);

  const handleEdit = useCallback((t: AdminTemplate) => {
    setEditingTemplate(t);
    setAdminDialogOpen(true);
  }, []);

  const handleCreateOpen = useCallback(() => {
    setEditingTemplate(null);
    setAdminDialogOpen(true);
  }, []);

  const handleAdminDialogClose = useCallback(() => {
    setAdminDialogOpen(false);
    setEditingTemplate(null);
  }, []);

  // ── Derived: filtered list ───────────────────────────────────
  const adminFiltered = adminTemplates.filter((t) => {
    const matchCat    = adminFilterCat === "all" || t.categoryId === adminFilterCat;
    const matchSearch = t.title.toLowerCase().includes(adminSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Filter toggle ──────────────────────────────────────────────
  const filtersOpen     = isAdmin ? adminFiltersOpen : userFiltersOpen;
  const hasActiveFilter = isAdmin ? adminFilterCat !== "all" : (!!category && category !== "all");

  const toggleFilters = useCallback(() => {
    if (isAdmin) setAdminFiltersOpen((v) => !v);
    else         setUserFiltersOpen((v) => !v);
  }, [isAdmin]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {isAdmin && (
        <div className="flex items-center justify-end">
          <Button onClick={handleCreateOpen} className="gap-2">
            <Plus className="h-4 w-4" /> Create Template
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col items-center gap-3 mb-6 w-full">
        <div className="flex items-center gap-2 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search templates..."
              value={isAdmin ? adminSearch : search}
              onChange={(e) => isAdmin ? setAdminSearch(e.target.value) : setSearch(e.target.value)}
              className="pl-9 bg-white rounded-xl h-9 text-sm"
            />
          </div>
          <button
            onClick={toggleFilters}
            className={`sm:hidden flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors ${
              filtersOpen || hasActiveFilter
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className={`w-full flex justify-center overflow-hidden transition-all duration-300 ease-in-out ${
          filtersOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 sm:max-h-40 sm:opacity-100"
        }`}>
          <div className="flex flex-wrap justify-center gap-2 pt-1 pb-0.5 px-1">
            {visibleCategories.map((cat) => {
              const isActive = isAdmin ? adminFilterCat === cat.id : category === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "pill-active" : "pill"}
                  size="sm"
                  onClick={() => isAdmin ? setAdminFilterCat(cat.id) : setCategory(cat.id)}
                  className="gap-1.5"
                >
                   {cat.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {!isAdmin && error && <p className="text-sm text-destructive">{error}</p>}

      {/* Grid */}
      {isAdmin ? (
        adminFiltered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            {adminSearch
              ? `No results for "${adminSearch}"`
              : "No templates yet. Create one!"}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{adminFiltered.length} templates</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {adminFiltered.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={{
                    id:            t.id,
                    name:          t.title,
                    category:      t.category,
                    imageUrl:      t.imageUrl ?? "",
                    overlayConfig: t.overlayConfig,
                  }}
                  onClick={() => {}}
                  isAdmin
                  isDeleting={deletingId === t.id}
                  onEdit={() => handleEdit(t)}
                  onDelete={() => handleDeleteRequest(t)}
                />
              ))}
            </div>
          </>
        )
      ) : isLoading ? (
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
      )}

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

      <TemplateDialog template={selectedTemplate}  onClose={() => setSelectedTemplate(null)} />

      {isAdmin && (
        <AdminTemplateDialog
          open={adminDialogOpen}
          onClose={handleAdminDialogClose}
          onSave={handleAdminSave}
          editing={editingTemplate}
        />
      )}

      {isAdmin && (
        <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this template?</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-700">{deleteTarget?.title}</span>{" "}
                will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteConfirm}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// ── Skeleton & Empty ───────────────────────────────────────────
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
        : <p>No templates in this category yet.</p>}
    </div>
  );
}