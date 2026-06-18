"use client"

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CardItemProps {
  id: string;
  imageUrl: string;
  cardType: string;
  recipientName: string;
  createdAt: string;
  onDelete: () => void;
  onDownload: () => void;
}

export function CardItem({
  imageUrl,
  cardType,
  recipientName,
  createdAt,
  onDelete,
  onDownload,
}: CardItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Preview */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
        <img
          src={imageUrl}
          alt={`${cardType} card for ${recipientName}`}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
        
        {/* Action Buttons Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 ${
            isHovered ? "opacity-100" : "opacity-100 md:opacity-0"
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full shadow-sm"
                onClick={onDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerate</TooltipContent>
          </Tooltip> */}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-10 w-10 rounded-full shadow-sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Card Information */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {cardType}
            </span>
            <h3 className="mt-2 truncate text-sm font-medium text-foreground">
              {recipientName}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
