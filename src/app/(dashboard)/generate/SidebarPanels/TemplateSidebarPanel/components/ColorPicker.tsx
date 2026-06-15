"use client";

import { useState } from "react";

const PRESET_COLORS = [
  "#ffffff", "#111827", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
] as const;

const isPreset    = (color: string) => (PRESET_COLORS as readonly string[]).includes(color);
const sanitizeHex = (raw: string): string => {
  const s = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : "";
};

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ label, color, onChange, disabled }: ColorPickerProps) {
  // Track what the user is actively typing — resets when color prop changes
  const [draftColor, setDraftColor] = useState(color);
  const [hexError, setHexError]     = useState(false);

  // Derived: if prop changed externally, draft is stale — show prop value
  const hexDraft = draftColor === color || sanitizeHex(draftColor) === color
    ? draftColor
    : color;

  const custom = !isPreset(color);

  const handlePreset = (c: string) => {
    onChange(c);
    setDraftColor(c);
    setHexError(false);
  };

  const handleHexInput = (val: string) => {
    setDraftColor(val);
    const valid = sanitizeHex(val);
    if (valid) { setHexError(false); onChange(valid); }
    else setHexError(true);
  };

  const handleColorPicker = (val: string) => {
    onChange(val);
    setDraftColor(val);
    setHexError(false);
  };

  const handleBlur = () => {
    if (!sanitizeHex(draftColor)) {
      setDraftColor(color);
      setHexError(false);
    }
  };

  return (
    <div className={`space-y-1.5 rounded-lg border border-border bg-muted/10 p-2 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground">{label}</span>
        {custom && <span className="font-mono text-[9px] uppercase text-muted-foreground">{color}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {PRESET_COLORS.map((c) => (
          <button
            key={c} type="button" onClick={() => handlePreset(c)} disabled={disabled}
            aria-pressed={color === c}
            className={`h-5 w-5 rounded-full border-2 transition-all focus-visible:outline-none
              ${color === c ? "scale-110 border-primary ring-1 ring-primary/30" : "border-border hover:scale-105"}
              ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <label
          className={`relative h-5 w-5 overflow-hidden rounded-full border-2 transition-all
            ${custom ? "scale-110 border-primary ring-1 ring-primary/30" : "border-border hover:scale-105"}
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          style={{ background: "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)" }}
        >
          <input
            type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={color}
            onChange={(e) => handleColorPicker(e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-muted-foreground">#</span>
        <input
          type="text" maxLength={6}
          value={hexDraft.replace("#", "")}
          onChange={(e) => handleHexInput(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
          onBlur={handleBlur}
          placeholder="ffffff" disabled={disabled}
          className={`w-14 rounded border px-1.5 py-0.5 font-mono text-[10px] outline-none
            focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed
            ${hexError ? "border-red-400 bg-red-50 text-red-600" : "border-border bg-background text-foreground"}`}
        />
        {hexError && <span className="text-[9px] text-red-500">Invalid</span>}
        <span className="ml-auto h-4 w-4 flex-shrink-0 rounded-full border border-border shadow-sm"
          style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}