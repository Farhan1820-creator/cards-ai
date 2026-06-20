"use client";

import React, { useEffect, useRef, useState } from "react";
import { OverlayConfigurator, DEFAULT_OVERLAY_CONFIG, type OverlayConfig } from "./OverlayConfigurator";

export interface CategoryDef { id: string; label: string; }
// ⚠️ icon field hata diya hai — agar kahin aur CategoryDef.icon use ho raha
// ho (e.g. TemplateGrid/category filters), wahan bhi check kar lena.

interface CategoryRow {
  id: string;
  name: string;
  templateCount: number;
}

export interface AdminTemplate {
  id:            string;
  title:         string;
  categoryId:    string;
  imageUrl:      string | null;
  createdAt:     Date | null;
  overlayConfig: OverlayConfig | null;
}

export interface AdminTemplateDialogData {
  name:          string;
  categoryId:    string;
  base64:        string | null;
  overlayConfig: OverlayConfig;
}

interface Props {
  open:     boolean;
  onClose:  () => void;
  onSave:   (data: AdminTemplateDialogData) => Promise<void>;
  editing?: AdminTemplate | null;
}

const COLOR_PALETTE = [
  { activeBg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-400"    },
  { activeBg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-400"   },
  { activeBg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-400"  },
  { activeBg: "bg-teal-50",    text: "text-teal-600",    border: "border-teal-400"    },
  { activeBg: "bg-sky-50",     text: "text-sky-600",     border: "border-sky-400"     },
  { activeBg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-400" },
  { activeBg: "bg-pink-50",    text: "text-pink-600",    border: "border-pink-400"    },
];

function getCategoryColor(index: number) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

type Tab = "template" | "category";

export function AdminTemplateDialog({ open, onClose, onSave, editing }: Props) {
  const fileRef    = useRef<HTMLInputElement>(null);
  const catNameRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("template");

  // ── Template form state ──────────────────────────────────
  const [title,         setTitle]         = useState("");
  const [categoryId,    setCategoryId]    = useState<string | null>(null);
  const [preview,       setPreview]       = useState<string | null>(null);
  const [file,          setFile]          = useState<File | null>(null);
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>(DEFAULT_OVERLAY_CONFIG);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [loading,       setLoading]       = useState(false);
  const [dragging,      setDragging]      = useState(false);

  // ── Category data (shared by both tabs) ──────────────────
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);

  // ── Category tab CRUD state ──────────────────────────────
  const [catName,       setCatName]       = useState("");
  const [catEditingId,  setCatEditingId]  = useState<string | null>(null);
  const [catError,      setCatError]      = useState("");
  const [catLoading,    setCatLoading]    = useState(false);
  const [catDeletingId, setCatDeletingId] = useState<string | null>(null);

  // Categories admin endpoint se fetch — count ke saath, dialog open hote
  // hi (taake har dafa fresh data mile, especially delete ke baad).
useEffect(() => {
  if (!open) return;
  fetch("/api/admin/categories")
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.text();
        console.error("Categories fetch failed:", res.status, body);
        setCategoryRows([]); // fallback, crash mat hone do
        return;
      }
      const rows: CategoryRow[] = await res.json();
      setCategoryRows(rows);
    })
    .catch((err) => {
      console.error("Categories fetch error:", err);
      setCategoryRows([]);
    });
}, [open]);

  useEffect(() => {
    if (open) {
      setActiveTab("template");
      setTitle(editing?.title ?? "");
      setCategoryId(editing?.categoryId ?? null);
      setPreview(editing?.imageUrl ?? null);
      setOverlayConfig(editing?.overlayConfig ?? DEFAULT_OVERLAY_CONFIG);
      setFile(null);
      setErrors({});
      setCatName("");
      setCatEditingId(null);
      setCatError("");
    }
  }, [open, editing]);

  useEffect(() => {
    if (activeTab === "category" && catEditingId) catNameRef.current?.focus();
  }, [activeTab, catEditingId]);

  const categoryDefs: CategoryDef[] = categoryRows.map((c) => ({ id: c.id, label: c.name }));

  function handleFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "Only image files accepted." }));
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
    setErrors((e) => ({ ...e, image: "" }));
  }

  async function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!title.trim())  errs.title    = "Title is required.";
    if (!categoryId)    errs.category = "Please select a category.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const base64 = file
      ? await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        })
      : null;

    await onSave({ name: title.trim(), categoryId, base64, overlayConfig });
    setLoading(false);
    onClose();
  }

  // ── Category tab CRUD handlers ───────────────────────────
  function resetCatForm() {
    setCatName("");
    setCatEditingId(null);
    setCatError("");
  }

  function handleCatEditClick(row: CategoryRow) {
    setCatEditingId(row.id);
    setCatName(row.name);
    setCatError("");
  }

  async function handleCatSubmit() {
    const name = catName.trim();
    if (!name) { setCatError("Category name required."); return; }
    if (name.toLowerCase() === "all") { setCatError('"all" reserved hai, koi dusra naam choose karo.'); return; }
    const dup = categoryRows.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== catEditingId
    );
    if (dup) { setCatError("Already exists."); return; }

    setCatLoading(true);
    try {
      if (catEditingId) {
        const res = await fetch(`/api/admin/categories/${catEditingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error();
        const updated: { id: string; name: string } = await res.json();
        setCategoryRows((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, name: updated.name } : c))
        );
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error();
        const created: { id: string; name: string } = await res.json();
        setCategoryRows((prev) => [...prev, { id: created.id, name: created.name, templateCount: 0 }]);
      }
      resetCatForm();
    } catch {
      setCatError(catEditingId ? "Update nahi ho payi, dobara try karo." : "Category create nahi ho payi, dobara try karo.");
    } finally {
      setCatLoading(false);
    }
  }

  async function handleCatDelete(row: CategoryRow) {
    if (row.templateCount > 0 || catDeletingId) return;
    setCatDeletingId(row.id);
    try {
      const res = await fetch(`/api/admin/categories/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCategoryRows((prev) => prev.filter((c) => c.id !== row.id));
      if (categoryId === row.id) setCategoryId(null);
      if (catEditingId === row.id) resetCatForm();
    } catch {
      setCatError("Delete nahi ho payi, dobara try karo.");
    } finally {
      setCatDeletingId(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">Template Studio</p>
              <h2 className="text-2xl font-bold text-gray-900">{editing ? "Edit Template" : "Create Template"}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {(["template", "category"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "template" ? "Template" : "Category"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {activeTab === "template" ? (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elegant Wedding Invite"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? "border-red-300 focus:ring-red-200 bg-red-50"
                      : "border-gray-200 focus:ring-primary/20 focus:border-primary bg-gray-50"
                  }`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              {/* Category select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryDefs.map((cat, i) => {
                    const isSelected = categoryId === cat.id;
                    const color = getCategoryColor(i);
                    return (
                      <button
                        key={cat.id} type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`px-3.5 py-2 rounded-full border text-sm font-semibold transition-all ${
                          isSelected
                            ? `${color.activeBg} ${color.text} ${color.border} border-2`
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                  {categoryDefs.length === 0 && (
                    <p className="text-xs text-gray-400">No categories yet — add one in the Category tab.</p>
                  )}
                </div>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template Image</label>
                <div
                  className={`relative border-2 border-dashed rounded-2xl cursor-pointer overflow-hidden transition-all ${
                    dragging ? "border-primary bg-primary/5" : errors.image ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-primary/40"
                  }`}
                  onDragOver={(e)  => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0] ?? null); }}
                  onClick={() => fileRef.current?.click()}
                >
                  {preview ? (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Preview" className="w-full object-contain p-2" style={{ aspectRatio: "1080 / 1350" }} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">Click to replace</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">{dragging ? "Drop here!" : "Drag & drop or click to upload"}</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10 MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                </div>
                {preview && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    ✕ Remove image
                  </button>
                )}
                {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
              </div>

              {/* Overlay Configurator */}
              {preview && (
                <div className="border-t border-gray-100 pt-5">
                  <OverlayConfigurator imageUrl={preview} config={overlayConfig} onChange={setOverlayConfig} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Add / Edit category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {catEditingId ? "Edit Category" : "New Category"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={catNameRef}
                    type="text" value={catName}
                    onChange={(e) => { setCatName(e.target.value); setCatError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCatSubmit(); if (e.key === "Escape") resetCatForm(); }}
                    placeholder="Category name..." maxLength={30}
                    disabled={catLoading}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                  />
                  <button
                    type="button" onClick={handleCatSubmit} disabled={catLoading}
                    className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {catLoading ? "Saving..." : catEditingId ? "Update" : "Add"}
                  </button>
                  {catEditingId && (
                    <button
                      type="button" onClick={resetCatForm} disabled={catLoading}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {catError && <p className="mt-1 text-xs text-red-500">{catError}</p>}
              </div>

              {/* Category table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold">Name</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Templates</th>
                      <th className="text-right px-4 py-2.5 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoryRows.map((row) => (
                      <tr key={row.id} className={catEditingId === row.id ? "bg-primary/5" : ""}>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{row.name}</td>
                        <td className="px-4 py-2.5 text-gray-500">{row.templateCount}</td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <button
                            type="button" onClick={() => handleCatEditClick(row)}
                            className="text-primary hover:text-primary/80 text-xs font-semibold mr-3"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCatDelete(row)}
                            disabled={row.templateCount > 0 || catDeletingId === row.id}
                            title={row.templateCount > 0 ? "Templates iss category mein hain, pehle unhe move/delete karo" : undefined}
                            className="text-red-500 hover:text-red-600 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-red-500"
                          >
                            {catDeletingId === row.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categoryRows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-xs">No categories yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          {activeTab === "template" ? (
            <>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={handleSubmit} disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-sm flex items-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={editing ? "M4 7.5l5.5 5.5L20 6" : "M12 4.5v15m7.5-7.5h-15"} /></svg>
                }
                {loading ? "Saving..." : editing ? "Save Changes" : "Create Template"}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}