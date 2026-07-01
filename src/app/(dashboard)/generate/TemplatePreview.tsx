"use client";

import { ImageIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCanvasCoords, type CanvasElement } from "./hooks/useCanvasCoords";
import { PhotoOverlayButton }                   from "./PhotoOverlayButton";
import { PanZoomAdjuster, type PhotoTransform } from "./PanZoomAdjuster";
import type { Template }                        from "./SidebarPanels/TemplateSidebarPanel/components/TemplateGrid";

const CANVAS_W = 1080;
const CANVAS_H = 1350;

const DEFAULT_OVERLAY = {
  photo:         { x: 540, y: 700,  r: 250 },
  recipientName: { x: 540, y: 1025, fontSize: 40 },
  message:       { x: 540, y: 1100, fontSize: 28 },
};

export interface TemplatePreviewProps {
  template:           Template | null;
  recipientName:      string;
  message:            string;
  photoUrl:           string | null;
  isGenerated:        boolean;
  isLoading:          boolean;
  nameColor?:         string;
  messageColor?:      string;
  isEditing?:         boolean;
  onPreviewReady?:    (dataUrl: string) => void;
  onRemovePhoto?:     () => void;
  photoTransform?:    PhotoTransform;
  onTransformChange?: (t: PhotoTransform) => void;
  overlayConfig?:     {
    photo:         { x: number; y: number; r: number };
    recipientName: { x: number; y: number; fontSize: number };
    message:       { x: number; y: number; fontSize: number };
  };
}

export function TemplatePreview({
  isEditing = false,
  template, recipientName, message, photoUrl,
  isGenerated, isLoading,
  nameColor = "", messageColor = "",
  onPreviewReady,
  onRemovePhoto: _onRemovePhoto,
   photoTransform: externalTransform,
  onTransformChange,
  overlayConfig,
}: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl,     setPreviewUrl]     = useState<string | null>(null);
  const [cropOpen,       setCropOpen]       = useState(false);
  const [photoTransform, setPhotoTransform] = useState<PhotoTransform>(
    externalTransform ?? { scale: 1, offsetX: 0, offsetY: 0 },
  );
const confirmedUrl = useRef<string | null>(null);
  const imageCache   = useRef<Map<string, HTMLImageElement>>(new Map());
  const bgImageRef   = useRef<HTMLImageElement | null>(null);

  const loadImg = useCallback((src: string) => {
    const cached = imageCache.current.get(src);
    if (cached) return Promise.resolve(cached);
    return new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload  = () => { imageCache.current.set(src, img); res(img); };
      img.onerror = rej;
      img.src     = src;
    });
  }, []);

  const config = useMemo(() => overlayConfig ?? DEFAULT_OVERLAY, [overlayConfig]);
  const { x: photoX, y: photoY, r: photoR } = config.photo;

  const elements = useMemo<CanvasElement[]>(
    () => [{ key: "photo", cx: photoX, cy: photoY, r: photoR }],
    [photoX, photoY, photoR],
  );

  const { ref: previewRef, domElements } = useCanvasCoords({
    canvasW: CANVAS_W, canvasH: CANVAS_H, elements,
  });

  // Sync controlled transform (edit mode)
  useEffect(() => {
    if (externalTransform) setPhotoTransform(externalTransform);
  }, [externalTransform]);

  // Reset on template deselect
  useEffect(() => {
    if (!template) {
      setPreviewUrl(null);
      setCropOpen(false);
      setPhotoTransform({ scale: 1, offsetX: 0, offsetY: 0 });
      confirmedUrl.current = null;
      onPreviewReady?.("");
    }
  }, [template]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open adjuster on fresh local photo upload
  useEffect(() => {
    if (photoUrl && photoUrl !== confirmedUrl.current) {
      if (photoUrl.startsWith("http") || isEditing) {
        confirmedUrl.current = photoUrl;
        setCropOpen(false);
      } else {
        setPhotoTransform({ scale: 1, offsetX: 0, offsetY: 0 });
        setCropOpen(true);
      }
    }
    if (!photoUrl) {
      setCropOpen(false);
      confirmedUrl.current = null;
    }
  }, [photoUrl, isEditing]);

  const handleConfirm = useCallback((t: PhotoTransform) => {
    setPhotoTransform(t);
    confirmedUrl.current = photoUrl;
    setCropOpen(false);
    onTransformChange?.(t);
  }, [photoUrl, onTransformChange]);

  const handleCloseCrop = useCallback(() => setCropOpen(false), []);

 // Debounce text inputs so canvas doesn't redraw on every keystroke
  const [debouncedName, setDebouncedName] = useState(recipientName);
  const [debouncedMessage, setDebouncedMessage] = useState(message);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedName(recipientName);
      setDebouncedMessage(message);
    }, 300);
    return () => clearTimeout(t);
  }, [recipientName, message]);

  // Canvas render
// Draws photo + text on top of the already-loaded background (no network call here)
  const drawScene = useCallback(async (cancelledRef: { current: boolean }) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d"); if (!ctx) return;
    const bg     = bgImageRef.current;
    if (!bg) return;

    try {
      canvas.width  = CANVAS_W;
      canvas.height = CANVAS_H;
      ctx.drawImage(bg, 0, 0, CANVAS_W, CANVAS_H);

      // Photo
      if (photoUrl && !cropOpen) {
        const img  = await loadImg(photoUrl);
        if (cancelledRef.current) return;
        const D    = photoR * 2;
        const base = Math.max(D / img.naturalWidth, D / img.naturalHeight);
        const fs   = base * photoTransform.scale;
        const sw   = img.naturalWidth  * fs;
        const sh   = img.naturalHeight * fs;
        const dx   = photoX - sw / 2 + photoTransform.offsetX;
        const dy   = photoY - sh / 2 + photoTransform.offsetY;
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, dx, dy, sw, sh);
        ctx.restore();
      }

      // Recipient name
      if (debouncedName.trim()) {
        ctx.font         = `bold ${config.recipientName.fontSize}px poppins,sans-serif`;
        ctx.fillStyle    = nameColor || "#fff";
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        const lh = config.recipientName.fontSize * 1.3;
        let line = "", y = config.recipientName.y;
        for (const word of debouncedName.split(" ")) {
          const test = line + word + " ";
          if (ctx.measureText(test).width > 900 && line) {
            ctx.fillText(line.trim(), config.recipientName.x, y);
            line = word + " "; y += lh;
          } else { line = test; }
        }
        ctx.fillText(line.trim(), config.recipientName.x, y);
      }

      // Message
      if (debouncedMessage.trim()) {
        ctx.font      = `${config.message.fontSize}px Arial,sans-serif`;
        ctx.fillStyle = messageColor || "#fff";
        ctx.textAlign = "center";
        const lh = config.message.fontSize * 1.4;
        let line = "", y = config.message.y;
        for (const word of debouncedMessage.split(" ")) {
          const test = line + word + " ";
          if (ctx.measureText(test).width > 900 && line) {
            ctx.fillText(line.trim(), config.message.x, y);
            line = word + " "; y += lh;
          } else { line = test; }
        }
        ctx.fillText(line.trim(), config.message.x, y);
      }

      if (cancelledRef.current) return;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setPreviewUrl(dataUrl);
      onPreviewReady?.(dataUrl);
    } catch (err) {
      console.error("Preview render error:", err);
    }
  }, [
    photoUrl, cropOpen, photoTransform, photoX, photoY, photoR,
    debouncedName, debouncedMessage, nameColor, messageColor,
    config, onPreviewReady, loadImg,
  ]);

  // Effect A — background image sirf template change pe load hoti hai (network/cache)
  useEffect(() => {
    if (!template) { bgImageRef.current = null; return; }
    let cancelled = false;
    const cancelledRef = { current: false };

    loadImg(template.imageUrl)
      .then((img) => {
        if (cancelled) return;
        bgImageRef.current = img;
        drawScene(cancelledRef);
      })
      .catch((err) => console.error("Background load error:", err));

    return () => { cancelled = true; };
  }, [template, loadImg, drawScene]);

  // Effect B — text/photo/transform change pe sirf in-memory redraw, koi network call nahi
  useEffect(() => {
    if (!template || !bgImageRef.current) return;
    const cancelledRef = { current: false };
    drawScene(cancelledRef);
    return () => { cancelledRef.current = true; };
  }, [template, debouncedName, debouncedMessage, photoUrl, photoTransform, cropOpen, drawScene]);
  
  
  const photoCircle = domElements.get("photo");

  return (
    <div className="space-y-2">
      <div className={isLoading ? "neon-loading" : ""}>
        <div
          ref={previewRef}
          className="relative z-[2] aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-muted/30"
        >
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <p className="text-xs text-muted-foreground">Generating…</p>
            </div>

          ) : previewUrl ? (
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Card preview" className="h-full w-full object-cover" />

              {photoUrl && photoCircle && (
                <PhotoOverlayButton
                  domElement={photoCircle}
                  onClick={() => setCropOpen(true)}
                />
              )}

              {isGenerated && (
                <div className="absolute bottom-2.5 right-2.5 rounded-full bg-black px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Generated
                </div>
              )}
            </div>

         ) : template ? (
  <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    <p className="text-xs">Loading preview…</p>
  </div>

) : (
  <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
      <ImageIcon className="h-7 w-7" />
    </div>
    <div className="text-center">
      <p className="text-sm font-medium">Select a template</p>
      <p className="mt-0.5 text-xs">Choose a template and fill in details to preview</p>
    </div>
  </div>
)}
        </div>
      </div>

      {/* ── PanZoomAdjuster — portal se document.body pe mount hoga ── */}
      {/* Card ke andar nahi, isliye card ki size se bilkul independent */}
      {cropOpen && photoUrl && (
        <PanZoomAdjuster
          photoUrl={photoUrl}
          photoR={photoR}
          initialTransform={photoTransform}
          onConfirm={handleConfirm}
          onClose={handleCloseCrop}
        />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}