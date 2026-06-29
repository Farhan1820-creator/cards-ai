import { useState, useEffect, useMemo } from "react";
import { Template } from "@/types/template";

export interface CategoryOption { id: string; name: string; }
export type FilterCategory = "all" | string;

const PAGE_SIZE = 8;
const ALL_OPTION: CategoryOption = { id: "all", name: "All" };

export { PAGE_SIZE };

// ── New: options interface ─────────────────────────────────────
interface UseTemplatesOptions {
  initialTemplates?:  Template[];
  initialCategories?: CategoryOption[];
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const { initialTemplates, initialCategories } = options;

  // Agar server ne data diya → seedha use karo, warna empty
  const [allTemplates, setAllTemplates] = useState<Template[]>(initialTemplates ?? []);

  // Agar server ne categories diya → prepend ALL_OPTION, warna sirf ALL_OPTION
  const [categories, setCategories] = useState<CategoryOption[]>(
    initialCategories ? [ALL_OPTION, ...initialCategories] : [ALL_OPTION]
  );

  // Server data hai → false, nahi hai → true (fetch pending)
  const [isLoading, setIsLoading] = useState(!initialTemplates);
  const [error, setError]         = useState<string | null>(null);
  const [category, setCategory]   = useState<FilterCategory>("all");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);

  // Categories: sirf tab fetch karo jab server se nahi aayi
  useEffect(() => {
    if (initialCategories) return; // ✅ server se aa gayi, skip
    fetch("/api/user/categories")
      .then((r) => r.json())
      .then((rows: CategoryOption[]) => setCategories([ALL_OPTION, ...rows]))
      .catch(() => {}); // fail silently — "All" filter still works
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Templates: "all" + server data already hai → skip initial fetch
  // Category change hone par → always fetch
  useEffect(() => {
    if (category === "all" && initialTemplates) return; // ✅ first load skip

    setIsLoading(true);
    setError(null);

    const url = category === "all"
      ? "/api/user/templates"
      : `/api/user/templates?categoryId=${category}`;

    fetch(url)
      .then((r) => { if (!r.ok) throw new Error("fetch failed"); return r.json(); })
      .then((data: Template[]) => { setAllTemplates(data); setPage(1); })
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));

  }, [category, initialTemplates]); // initialTemplates intentionally excluded — stable on mount

  const filtered = useMemo(() => {
    if (!search.trim()) return allTemplates;
    const q = search.toLowerCase();
    return allTemplates.filter((t) => t.name.toLowerCase().includes(q));
  }, [search, allTemplates]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = (cat: FilterCategory) => { setCategory(cat); setSearch(""); setPage(1); };
  const handleSearchChange   = (q: string)           => { setSearch(q); setPage(1); };

  return {
    templates: paginated,
    categories,
    isLoading,
    error,
    category,
    setCategory: handleCategoryChange,
    search,
    setSearch: handleSearchChange,
    page,
    setPage,
    totalPages,
    total: filtered.length,
  };
}