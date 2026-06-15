import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, ChevronDown, Share2, Download } from "lucide-react";
import { useRef, useState, useEffect } from "react";

type DownloadFormat = "PNG" | "JPEG" | "PDF";

interface ActionButtonsProps {
  hasPreview: boolean;
  onDownload: (format: DownloadFormat) => void;
  onRegenerate: () => void;
  onReset: () => void;
  onShare: () => void;
}

export function ActionButtons({
  hasPreview,
  onDownload,
  onRegenerate,
  onReset,
  onShare,
}: ActionButtonsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formats: { label: string; ext: string; value: DownloadFormat }[] = [
    { label: "PNG Image",      ext: ".png", value: "PNG"  },
    { label: "JPEG Image",     ext: ".jpg", value: "JPEG" },
  ];

  return (
    <div className="flex flex-wrap gap-2">

      {/* ── Download split-button ── */}
      <div className="relative flex" ref={dropdownRef}>
        {/* main action — default PNG */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreview}
          onClick={() => onDownload("PNG")}
          className="rounded-r-none border-r-0"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>

        {/* caret */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreview}
          onClick={() => setDropdownOpen((o) => !o)}
          className="rounded-l-none px-2"
          aria-label="Download options"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* dropdown */}
        {dropdownOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 z-50 min-w-[200px] rounded-xl border border-border bg-white shadow-md overflow-hidden">
            <p className="px-3 pt-2.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Download as
            </p>

            {formats.map((f) => (
              <>
                <button
                  key={f.value}
                  onClick={() => { onDownload(f.value); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <span className="text-muted-foreground font-mono text-xs w-9 text-right">
                    {f.ext}
                  </span>
                  <span>{f.label}</span>
                </button>
              </>
            ))}
          </div>
        )}
      </div>

      {/* ── Share ── */}
      <Button
        variant="outline"
        size="sm"
        onClick={onShare}
        disabled={!hasPreview}
        className="flex-1 sm:flex-none"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {/* ── Regenerate ── */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={!hasPreview}
        className="flex-1 sm:flex-none"
      >
        <RefreshCw className="h-4 w-4" />
        Regenerate
      </Button>

      {/* ── Reset ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="flex-1 sm:flex-none"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}