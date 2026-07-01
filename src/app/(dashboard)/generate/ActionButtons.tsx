import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, RotateCcw, ChevronDown, Share2, Download } from "lucide-react";

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
  const formats: { label: string; ext: string; value: DownloadFormat }[] = [
    { label: "PNG Image", ext: ".png", value: "PNG" },
    { label: "JPEG Image", ext: ".jpg", value: "JPEG" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 w-full lg:grid-cols-[1.3fr_1fr_1fr_1fr] rounded mb-15 md:mb-0">

      {/* Download split-button */}
      <div className="flex">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreview}
          onClick={() => onDownload("PNG")}
          className="flex-1 rounded-r-none border-r-0 justify-center"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPreview}
              className="rounded-l-none px-2 shrink-0"
              aria-label="Download options"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <p className="px-3 pt-2.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Download as
            </p>
            {formats.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => onDownload(f.value)}
                className="gap-3"
              >
                <span className="text-muted-foreground font-mono text-xs w-9 text-right">
                  {f.ext}
                </span>
                <span>{f.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button variant="outline" size="sm" onClick={onShare} disabled={!hasPreview} className="justify-center">
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Button variant="outline" size="sm" onClick={onRegenerate} disabled={!hasPreview} className="justify-center">
        <RefreshCw className="h-4 w-4" />
        Regenerate
      </Button>

      <Button variant="ghost" size="sm" onClick={onReset} className="justify-center">
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}