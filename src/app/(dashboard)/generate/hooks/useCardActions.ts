import { useCallback } from "react";
import { toast } from "sonner";
import { downloadImage } from "@/lib/download-image";
import { generateCardFilename } from "@/lib/filename";

/**
 * Download + Share for a generated card image.
 * Was duplicated (with slightly different Share behaviour) between the
 * AI-mode handlers in generate/page.tsx and TemplateCardGenerator.tsx —
 * now there's one implementation both modes use.
 */
export function useCardActions(
  image: string | null | undefined,
  cardType: string,
  recipientName?: string
) {
  const handleDownload = useCallback(
    (format: "PNG" | "JPEG" | "PDF" = "PNG") => {
      if (!image) return;
      if (format === "PDF") {
        toast.info("PDF export coming soon!");
        return;
      }
      const filename = generateCardFilename(cardType, recipientName);
      const ext = format === "JPEG" ? "jpg" : "png";
      downloadImage(image, `${filename}.${ext}`);
      toast.success(`${format} downloaded!`);
    },
    [image, cardType, recipientName]
  );

  const handleShare = useCallback(async () => {
    if (!image) return;
    try {
      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], generateCardFilename(cardType, recipientName), {
        type: blob.type || "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "My Card", files: [file] });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "My Card", url: image });
        return;
      }
      await navigator.clipboard.writeText(image);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  }, [image, cardType, recipientName]);

  return { handleDownload, handleShare };
}
