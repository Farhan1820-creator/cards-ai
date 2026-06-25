// src/app/(dashboard)/templates/hooks/useTemplates.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { Template } from "@/types/template";

export interface CategoryOption { id: string; name: string; }
export type FilterCategory = "all" | string; // "all" sentinel, ya category.id (UUID)

const PAGE_SIZE = 8;
const ALL_OPTION: CategoryOption = { id: "all", name: "All" };

export { PAGE_SIZE };

export function useTemplates() {
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([ALL_OPTION]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<FilterCategory>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);


// hooks/useTemplates.tsx — replace the two separate useEffects with one:

useEffect(() => {
  async function loadAll() {
    setIsLoading(true);
    try {
      const [catRes, tplRes] = await Promise.all([
        fetch("/api/user/categories"),
        fetch(category === "all" ? "/api/user/templates" : `/api/user/templates?categoryId=${category}`),
      ]);
      const [cats, templates] = await Promise.all([catRes.json(), tplRes.json()]);
      setCategories([ALL_OPTION, ...cats]);
      setAllTemplates(templates);
    } catch {
      setError("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }
  loadAll();
}, [category]); // ✅ single effect, parallel fetches



  // Client-side search
  const filtered = useMemo(() => {
    if (!search.trim()) return allTemplates;

    const q = search.toLowerCase();
    return allTemplates.filter((t) =>
      t.name.toLowerCase().includes(q)
    );
  }, [search, allTemplates]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = (cat: FilterCategory) => {
    setCategory(cat);
    setSearch("");
    setPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setPage(1); // reset page on search
  };

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