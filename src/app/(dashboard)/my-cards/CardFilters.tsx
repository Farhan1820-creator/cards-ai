"use client";

import { Search, X, SlidersHorizontal, ChevronDown, Calendar } from "lucide-react";
import { useState, useRef } from "react";

export interface CardFilters {
  search: string;
  categoryName: string;
  user: string;
  dateFrom: string;
  dateTo: string;
}

interface CardFiltersProps {
  filters: CardFilters;
  onChange: (filters: CardFilters) => void;
  isAdmin?: boolean;
  userOptions?: { email: string; name: string }[];
  categoryOptions?: { name: string; slug: string }[];
}

// Custom date input with placeholder support
function DateInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  min?: string;
  max?: string;
  hasError: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = !value;

  return (
<div
  className={`relative h-9 flex items-center rounded-xl border bg-white transition-colors cursor-pointer min-w-[120px] ${
    hasError
      ? "border-red-400 focus-within:ring-2 focus-within:ring-red-300"
      : "border-border focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary"
  }`}
  onClick={() => inputRef.current?.showPicker?.()}
>
      {/* Placeholder overlay — only when empty */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center gap-1.5 px-3 pointer-events-none">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground truncate">{placeholder}</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={`h-full w-full px-3 text-sm bg-transparent focus:outline-none rounded-xl ${
          isEmpty ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}

export function CardFilters({
  filters,
  onChange,
  isAdmin = false,
  userOptions = [],
  categoryOptions = [],
}: CardFiltersProps) {
  const [dateError, setDateError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function update(key: keyof CardFilters, value: string) {
    const updated = { ...filters, [key]: value };
    const from = key === "dateFrom" ? value : updated.dateFrom;
    const to = key === "dateTo" ? value : updated.dateTo;
    if (from && to && from > to) {
      setDateError("Start date cannot be after end date");
      return;
    }
    setDateError(null);
    onChange(updated);
  }

  function reset() {
    setDateError(null);
    onChange({ search: "", categoryName: "", user: "", dateFrom: "", dateTo: "" });
  }

  const activeFilterCount = [
    filters.categoryName,
    filters.user,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const hasActive = Object.values(filters).some(Boolean);

  const selectCls =
    "h-9 text-sm rounded-xl border border-border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer";

  return (
    <div className="flex flex-col items-center gap-3 mb-8 sm:mb-15 w-full">

      {/* Row 1: Search + mobile toggle */}
      <div className="flex items-center gap-2 w-full max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search cards by name & category..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`sm:hidden flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors ${
            filtersOpen || activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-primary-foreground text-muted-foreground border-border"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 bg-white/25 text-current rounded-full text-[10px] font-bold px-1.5 py-0.5 leading-none">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>

        {hasActive && (
          <button
            onClick={reset}
            className="sm:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear filters"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Row 2: Filters */}
      <div
        className={`w-full flex justify-center overflow-hidden transition-all duration-300 ease-in-out ${
          filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 sm:max-h-96 sm:opacity-100"
        }`}
      >
        <div className="flex flex-wrap justify-center gap-2 pt-1 pb-0.5 px-1">

          {/* Dynamic categories */}
          <select
            value={filters.categoryName}
            onChange={(e) => update("categoryName", e.target.value)}
            className={selectCls}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.slug} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* User filter — admin only */}
          {isAdmin && userOptions.length > 0 && (
            <select
              value={filters.user}
              onChange={(e) => update("user", e.target.value)}
              className={`${selectCls} max-w-[160px]`}
            >
              <option value="">All Users</option>
              {userOptions.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.email}
                </option>
              ))}
            </select>
          )}

          {/* Date From */}
          <DateInput
            value={filters.dateFrom}
            onChange={(v) => update("dateFrom", v)}
            placeholder="From date"
            max={filters.dateTo || undefined}
            hasError={!!dateError}
          />

          {/* Date To */}
          <DateInput
            value={filters.dateTo}
            onChange={(v) => update("dateTo", v)}
            placeholder="To date"
            min={filters.dateFrom || undefined}
            hasError={!!dateError}
          />

          {(hasActive || dateError) && (
            <button
              onClick={reset}
              className="hidden sm:flex h-9 items-center gap-1.5 px-3 text-sm text-muted-foreground hover:text-foreground rounded-xl border border-border bg-white hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {dateError && (
        <p className="text-xs text-red-500">{dateError}</p>
      )}
    </div>
  );
}