// src/app/(dashboard)/templates/hooks/useTemplates.ts
import { useState, useEffect, useCallback } from "react";
import { Template } from "@/types/template";

const CATEGORIES = ["birthday", "wedding", "anniversary", "invitation"] as const;
export type FilterCategory = (typeof CATEGORIES)[number];

const PAGE_SIZE = 8;

export { CATEGORIES, PAGE_SIZE };

export function useTemplates() {
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<FilterCategory>("birthday");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/templates?category=${category}`);
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
  const filtered = search.trim()
    ? allTemplates.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    : allTemplates;

  // Client-side pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
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