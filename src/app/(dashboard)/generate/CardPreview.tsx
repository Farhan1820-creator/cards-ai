import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface CardPreviewProps {
  imageUrl?: string;
  isLoading?: boolean;
}

export function CardPreview({ imageUrl, isLoading }: CardPreviewProps) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-4/5 w-full overflow-hidden rounded-xl border border-border bg-card shadow-card",
          "flex items-center justify-center"
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 animate-pulse-soft rounded-2xl bg-muted" />
            <div className="h-3 w-24 animate-pulse-soft rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse-soft rounded bg-muted" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            height={64}
            width={64}
            alt="Generated card preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ImageIcon className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium">Your card will appear here</p>
            <p className="text-xs">Fill in the details and click Generate</p>
          </div>
        )}
      </div>
    </div>
  );
}
