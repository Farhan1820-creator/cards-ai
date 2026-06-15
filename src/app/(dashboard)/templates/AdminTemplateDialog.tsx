"use client";

import React, { useEffect, useRef, useState } from "react";
import { OverlayConfigurator, DEFAULT_OVERLAY_CONFIG, type OverlayConfig } from "./OverlayConfigurator";

const DEFAULT_CATEGORIES = [
  { id: "birthday",    label: "Birthday",    icon: "🎂" },
  { id: "wedding",     label: "Wedding",     icon: "💍" },
  { id: "anniversary", label: "Anniversary", icon: "📅" },
  { id: "invitation",  label: "Invitation",  icon: "✉️" },
  { id: "custom",      label: "Custom",      icon: "✦"  },
];

export interface CategoryDef { id: string; label: string; icon: string; }

export interface AdminTemplate {
  id:            string;
  title:         string;
  category:      string;
  imageUrl:      string | null;
  createdAt:     Date | null;
  overlayConfig: OverlayConfig | null;
}

export interface AdminTemplateDialogData {
  name:          string;
  category:      string;
  base64:        string | null;
  overlayConfig: OverlayConfig;
}

interface Props {
  open:     boolean;
  onClose:  () => void;
  onSave:   (data: AdminTemplateDialogData) => Promise<void>;
  editing?: AdminTemplate | null;
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
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

export function AdminTemplateDialog({ open, onClose, onSave, editing }: Props) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const newCatRef = useRef<HTMLInputElement>(null);

  const [title,         setTitle]         = useState("");
  const [category,      setCategory]      = useState("");
  const [preview,       setPreview]       = useState<string | null>(null);
  const [file,          setFile]          = useState<File | null>(null);
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>(DEFAULT_OVERLAY_CONFIG);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [loading,       setLoading]       = useState(false);
  const [dragging,      setDragging]      = useState(false);
  const [showAddCat,    setShowAddCat]    = useState(false);
  const [newCatName,    setNewCatName]    = useState("");
  const [addCatError,   setAddCatError]   = useState("");
  const [categories,    setCategories]    = useState<CategoryDef[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setCategory(editing?.category ?? "");
      setPreview(editing?.imageUrl ?? null);
      setOverlayConfig(editing?.overlayConfig ?? DEFAULT_OVERLAY_CONFIG);
      setFile(null);
      setErrors({});
      setShowAddCat(false);
      setNewCatName("");
      setAddCatError("");
    }
  }, [open, editing]);

  useEffect(() => {
    if (showAddCat) newCatRef.current?.focus();
  }, [showAddCat]);

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

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) { setAddCatError("Category name required."); return; }
    const id = slugify(name);
    if (categories.find((c) => c.id === id)) { setAddCatError("Already exists."); return; }
    const icons = ["⭐", "🎉", "🌸", "🎨", "📌", "🌟", "💫", "🎁"];
    const newCat: CategoryDef = {
      id,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      icon:  icons[categories.length % icons.length],
    };
    setCategories((prev) => [...prev, newCat]);
    setCategory(id);
    setNewCatName("");
    setShowAddCat(false);
    setAddCatError("");
  }

  async function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title    = "Title is required.";
    if (!category)     errs.category = "Please select a category.";
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

    await onSave({ name: title.trim(), category, base64, overlayConfig });
    setLoading(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
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
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">

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

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Card Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, i) => {
                const isSelected = category === cat.id;
                const color = getCategoryColor(i);
                return (
                  <button
                    key={cat.id} type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold transition-all ${
                      isSelected
                        ? `${color.activeBg} ${color.text} ${color.border} border-2`
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{cat.icon}</span>{cat.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowAddCat((v) => !v)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-dashed border-primary/40 bg-white text-primary text-sm font-semibold hover:bg-primary/5 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Category
              </button>
            </div>
            {showAddCat && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  ref={newCatRef} type="text" value={newCatName}
                  onChange={(e) => { setNewCatName(e.target.value); setAddCatError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") setShowAddCat(false); }}
                  placeholder="Category name..." maxLength={30}
                  className="flex-1 px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button type="button" onClick={handleAddCategory} className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold">Add</button>
                <button type="button" onClick={() => { setShowAddCat(false); setNewCatName(""); setAddCatError(""); }} className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">✕</button>
              </div>
            )}
            {addCatError   && <p className="mt-1 text-xs text-red-500">{addCatError}</p>}
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

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
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
        </div>
      </div>
    </div>
  );
}