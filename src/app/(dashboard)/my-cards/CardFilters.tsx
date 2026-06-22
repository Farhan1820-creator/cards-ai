"use client";

import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState } from "react";

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
}

export function CardFilters({
  filters,
  onChange,
  isAdmin = false,
  userOptions = [],
}: CardFiltersProps) {
  const [dateError, setDateError]   = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function update(key: keyof CardFilters, value: string) {
    const updated = { ...filters, [key]: value };
    const from = key === "dateFrom" ? value : updated.dateFrom;
    const to   = key === "dateTo"   ? value : updated.dateTo;
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

  // ── Shared input classes ──────────────────────────────────────
  const selectCls =
    "h-9 text-sm rounded-xl border border-border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer";

  const dateCls = (err: boolean) =>
    `h-9 text-sm rounded-xl border px-3 bg-white focus:outline-none focus:ring-2 transition-colors ${
      err
        ? "border-red-400 focus:ring-red-300"
        : "border-border focus:ring-primary/30 focus:border-primary"
    }`;

  return (
    <div className="flex flex-col items-center gap-3 mb-6 w-full">

      {/* ── Row 1: Search + mobile filter toggle ── */}
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

        {/* Mobile: Filters toggle button */}
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`sm:hidden flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors ${
            filtersOpen || activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-primary text-white border-border text-muted-foreground hover:text-foreground"
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

        {/* Mobile: Clear when active */}
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

      {/* ── Row 2: Filters — always visible on sm+, collapsible on mobile ── */}
      <div
        className={`w-full flex justify-center overflow-hidden transition-all duration-300 ease-in-out ${
          filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 sm:max-h-96 sm:opacity-100"
        }`}
      >
        <div className="flex flex-wrap justify-center gap-2 pt-1 pb-0.5 px-1">

          {/* Card Type */}
          <select
            value={filters.categoryName}
            onChange={(e) => update("categoryName", e.target.value)}
            className={selectCls}
          >
            <option value="">All Categories</option>
            <option value="birthday">Birthday</option>
            <option value="wedding">Wedding</option>
            <option value="anniversary">Anniversary</option>
            <option value="graduation">Graduation</option>
            <option value="eid">Eid</option>
            <option value="christmas">Christmas</option>
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
                  {u.name && u.email}
                </option>
              ))}
            </select>
          )}

          {/* Date From */}
          <input
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(e) => update("dateFrom", e.target.value)}
            className={dateCls(!!dateError)}
          />

          {/* Date To */}
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(e) => update("dateTo", e.target.value)}
            className={dateCls(!!dateError)}
          />

          {/* Clear — desktop only (mobile has the X button in row 1) */}
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

      {/* Date error */}
      {dateError && (
        <p className="text-xs text-red-500">{dateError}</p>
      )}
    </div>
  );
}