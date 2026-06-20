"use client";

import { useRouter } from "next/navigation";
import { Template } from "@/types/template";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import MobileSheet from "./MobileSheet";

interface TemplateDialogProps {
  template: Template | null;
  onClose: () => void;
}

export function TemplateDialog({ template, onClose }: TemplateDialogProps) {
  const router = useRouter();

const handleUseTemplate = () => {
  if (!template) return;
  router.push(
    `/generate?templateId=${template.id}&categoryId=${template.categoryId}`
  );
  onClose();
};

  return (
    <>
      {/* ───────── DESKTOP DIALOG ───────── */}
      <Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="hidden sm:flex max-w-2xl p-0 overflow-hidden bg-primary-foreground">
          <DialogTitle className="sr-only">
            {template?.name ?? "Template Preview"}
          </DialogTitle>

          {template && (
            <div className="flex w-full">
              {/* Image */}
              <div className="relative w-64 shrink-0 aspect-[3/4]">
                <img
                  src={template.imageUrl}
                  alt={template.name}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between flex-1 p-6 gap-6">
                <div className="space-y-3">
                  <Badge variant="secondary" className="capitalize">
                    {template.category}
                  </Badge>

                  <h2 className="text-xl font-semibold leading-tight">
                    {template.name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Use this template as a starting point. You can customize
                    text, colors, and images on the next step.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleUseTemplate}
                    className="active:scale-[0.98] transition"
                  >
                    Use Template
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="active:scale-[0.98] transition"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ───────── MOBILE SHEET ───────── */}
      {template && (
        <div className="sm:hidden">
          <MobileSheet
            template={template}
            onClose={onClose}
            onUse={handleUseTemplate}
          />
        </div>
      )}
    </>
  );
}