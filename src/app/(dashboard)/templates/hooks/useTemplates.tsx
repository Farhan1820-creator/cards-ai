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

  // Categories sirf ek baar fetch hon — list rarely change hoti hai per-session.
  // Route ab seedha [{id, name}][] array return karta hai, koi wrapper nahi.
  useEffect(() => {
    fetch("/api/user/categories")
      .then((res) => res.json())
      .then((rows: { id: string; name: string }[]) => {
        setCategories([ALL_OPTION, ...rows]);
      })
      .catch(() => {
        // fail silently — "all" filter still works even agar yeh fetch fail ho
      });
  }, []);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url =
        category === "all"
          ? "/api/user/templates"
          : `/api/user/templates?categoryId=${category}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data: Template[] = await res.json();
      setAllTemplates(data);
      setPage(1); // reset page on new category
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

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