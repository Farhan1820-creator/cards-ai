// components/templates/TemplateDialog.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Template } from "@/types/template";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TemplateDialogProps {
  template: Template | null;
  onClose: () => void;
}

export function TemplateDialog({ template, onClose }: TemplateDialogProps) {
  const router = useRouter();

const handleUseTemplate = () => {
  if (!template) return;
  const params = new URLSearchParams({
    templateId: template.id,
    cardType: template.category,
  });
  router.push(`/generate?${params}`);
  onClose();
};

  return (
    <Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 bg-primary-foreground">
        <DialogTitle className="sr-only">
          {template?.name ?? "Template Preview"}
        </DialogTitle>

        {template && (
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-64 shrink-0 aspect-[3/4]">
              <Image
                src={template.thumbnail}
                alt={template.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 256px"
                priority
              />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between gap-6 p-6 flex-1">
              {/* Header */}
              <div className="space-y-3">
                <Badge variant="secondary" className="capitalize">
                  {template.category}
                </Badge>
                <h2 className="text-xl font-semibold leading-tight">
                  {template.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use this template as a starting point. You can customize the
                  text, colors, and images on the next step.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button onClick={handleUseTemplate} className="w-full">
                  Use Template
                </Button>
                <Button variant="ghost" className="w-full" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}