"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────
export interface OverlayConfig {
  photo:         { x: number; y: number; r: number };
  recipientName: { x: number; y: number; fontSize: number };
  message:       { x: number; y: number; fontSize: number };
}

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  photo:         { x: 540, y: 700,  r: 250 },
  recipientName: { x: 540, y: 1025, fontSize: 40 },
  message:       { x: 540, y: 1100, fontSize: 28 },
};

const CANVAS_W = 1080;
const CANVAS_H = 1350;

type DragTarget = "photo" | "recipientName" | "message" | null;

interface OverlayConfiguratorProps {
  imageUrl:  string;                               // template background (base64 or URL)
  config:    OverlayConfig;
  onChange:  (config: OverlayConfig) => void;
}

// ── Helpers ───────────────────────────────────────────────────
function canvasToDOM(
  canvasX: number,
  canvasY: number,
  rect: DOMRect,
): { x: number; y: number } {
  const scaleX = rect.width  / CANVAS_W;
  const scaleY = rect.height / CANVAS_H;
  return { x: canvasX * scaleX, y: canvasY * scaleY };
}

function domToCanvas(
  domX: number,
  domY: number,
  rect: DOMRect,
): { x: number; y: number } {
  const scaleX = CANVAS_W / rect.width;
  const scaleY = CANVAS_H / rect.height;
  return { x: domX * scaleX, y: domY * scaleY };
}

// ── Component ─────────────────────────────────────────────────
export function OverlayConfigurator({ imageUrl, config, onChange }: OverlayConfiguratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [dragging,   setDragging]   = useState<DragTarget>(null);
  const dragOffset   = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Preload image
  useEffect(() => {
    setImgLoaded(false);
    const img    = new Image();
    img.onload   = () => { imgRef.current = img; setImgLoaded(true); };
    img.onerror  = () => setImgLoaded(false);
    img.crossOrigin = "anonymous";
    img.src      = imageUrl;
  }, [imageUrl]);

  // ── Pointer handlers ─────────────────────────────────────────
  const getRect = useCallback(() => containerRef.current?.getBoundingClientRect() ?? null, []);

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    target: DragTarget,
  ) => {
    e.stopPropagation();
    const rect = getRect(); if (!rect) return;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const cv   = domToCanvas(relX, relY, rect);

    let anchorX = 0, anchorY = 0;
    if (target === "photo")         { anchorX = config.photo.x;         anchorY = config.photo.y; }
    if (target === "recipientName") { anchorX = config.recipientName.x; anchorY = config.recipientName.y; }
    if (target === "message")       { anchorX = config.message.x;       anchorY = config.message.y; }

    dragOffset.current = { x: cv.x - anchorX, y: cv.y - anchorY };
    setDragging(target);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [config, getRect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = getRect(); if (!rect) return;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const cv   = domToCanvas(relX, relY, rect);
    const nx   = Math.round(cv.x - dragOffset.current.x);
    const ny   = Math.round(cv.y - dragOffset.current.y);

    // Clamp to canvas
    const cx = Math.max(0, Math.min(CANVAS_W, nx));
    const cy = Math.max(0, Math.min(CANVAS_H, ny));

    if (dragging === "photo") {
      onChange({ ...config, photo: { ...config.photo, x: cx, y: cy } });
    } else if (dragging === "recipientName") {
      onChange({ ...config, recipientName: { ...config.recipientName, x: cx, y: cy } });
    } else if (dragging === "message") {
      onChange({ ...config, message: { ...config.message, x: cx, y: cy } });
    }
  }, [dragging, config, onChange, getRect]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  // ── Render overlay elements as DOM elements over the image ────
  const renderOverlays = () => {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect || !imgLoaded) return null;

  const scaleX = rect.width / CANVAS_W;  // 👈 add karo

  const photoDOM = canvasToDOM(config.photo.x, config.photo.y, rect);
  const nameDOM  = canvasToDOM(config.recipientName.x, config.recipientName.y, rect);
  const msgDOM   = canvasToDOM(config.message.x, config.message.y, rect);
  const photoR   = config.photo.r * scaleX;

  const nameFontSize = config.recipientName.fontSize * scaleX;  // 👈 add karo
  const msgFontSize  = config.message.fontSize * scaleX;        // 👈 add karo

    return (
      <>
        {/* Photo circle */}
        <div
          onPointerDown={(e) => handlePointerDown(e, "photo")}
          style={{
            position:    "absolute",
            left:        photoDOM.x - photoR,
            top:         photoDOM.y - photoR,
            width:       photoR * 2,
            height:      photoR * 2,
            borderRadius: "50%",
            border:      `2px dashed ${dragging === "photo" ? "#6366f1" : "#ffffff"}`,
            background:  "rgba(99,102,241,0.15)",
            cursor:      "grab",
            display:     "flex",
            alignItems:  "center",
            justifyContent: "center",
            userSelect:  "none",
            touchAction: "none",
            boxShadow:   dragging === "photo" ? "0 0 0 2px #6366f1" : "none",
            transition:  "border-color 0.15s, box-shadow 0.15s",
          }}
        >
          <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.8)", pointerEvents: "none" }}>
            📷 Photo
          </span>
        </div>

        {/* Recipient name */}
        <div
          onPointerDown={(e) => handlePointerDown(e, "recipientName")}
          style={{
            position:   "absolute",
            left:       nameDOM.x,
            top:        nameDOM.y,
            transform:  "translate(-50%, -50%)",
            background: dragging === "recipientName" ? "rgba(99,102,241,0.85)" : "rgba(0,0,0,0.55)",
            color:      "#fff",
            fontSize: nameFontSize, 
            fontWeight: 700,
            padding:    "4px 10px",
            borderRadius: 6,
            cursor:     "grab",
            whiteSpace: "nowrap",
            userSelect: "none",
            touchAction: "none",
            border:     `1.5px dashed ${dragging === "recipientName" ? "#fff" : "rgba(255,255,255,0.5)"}`,
            transition: "background 0.15s",
          }}
        >
          Aa Recipient Name
        </div>

        {/* Message */}
        <div
          onPointerDown={(e) => handlePointerDown(e, "message")}
          style={{
            position:   "absolute",
            left:       msgDOM.x,
            top:        msgDOM.y,
            transform:  "translate(-50%, -50%)",
            background: dragging === "message" ? "rgba(99,102,241,0.85)" : "rgba(0,0,0,0.55)",
            color:      "#fff",
            fontSize: msgFontSize, 
            fontWeight: 600,
            padding:    "4px 10px",
            borderRadius: 6,
            cursor:     "grab",
            whiteSpace: "nowrap",
            userSelect: "none",
            touchAction: "none",
            border:     `1.5px dashed ${dragging === "message" ? "#fff" : "rgba(255,255,255,0.5)"}`,
            transition: "background 0.15s",
          }}
        >
          Aa Message text...
        </div>
      </>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Position Overlays
          <span className="ml-1.5 text-xs font-normal text-gray-400">drag to reposition</span>
        </label>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_OVERLAY_CONFIG)}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold"
        >
          Reset defaults
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          position:   "relative",
          width:      "100%",
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          overflow:   "hidden",
          borderRadius: 12,
          border:     "1.5px solid #e5e7eb",
          background: "#f3f4f6",
          cursor:     dragging ? "grabbing" : "default",
          userSelect: "none",
        }}
      >
        {imgLoaded ? (
          /* eslint-disable-next-line @next/next/no-img-element */
<img
  src={imageUrl}
  alt="Template background"
  style={{ 
    width: "100%", 
    height: "100%", 
    objectFit: "fill",  // cover → fill
    display: "block", 
    pointerEvents: "none" 
  }}
/>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="text-xs text-gray-400">Loading preview…</span>
          </div>
        )}

        {renderOverlays()}
      </div>

      {/* Coord readout */}
      <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="font-semibold text-gray-700 mb-0.5">📷 Photo</p>
          <p>x: {config.photo.x} · y: {config.photo.y}</p>
          <p>r: {config.photo.r}px</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="font-semibold text-gray-700 mb-0.5">✏️ Name</p>
          <p>x: {config.recipientName.x} · y: {config.recipientName.y}</p>
          <p>size: {config.recipientName.fontSize}px</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="font-semibold text-gray-700 mb-0.5">💬 Message</p>
          <p>x: {config.message.x} · y: {config.message.y}</p>
          <p>size: {config.message.fontSize}px</p>
        </div>
      </div>

      {/* Font size sliders */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-24 shrink-0">Name size: <b>{config.recipientName.fontSize}px</b></span>
          <input
            type="range" min={20} max={80} step={2}
            value={config.recipientName.fontSize}
            onChange={(e) => onChange({ ...config, recipientName: { ...config.recipientName, fontSize: Number(e.target.value) } })}
            className="flex-1 accent-indigo-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-24 shrink-0">Msg size: <b>{config.message.fontSize}px</b></span>
          <input
            type="range" min={14} max={60} step={2}
            value={config.message.fontSize}
            onChange={(e) => onChange({ ...config, message: { ...config.message, fontSize: Number(e.target.value) } })}
            className="flex-1 accent-indigo-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-24 shrink-0">Photo r: <b>{config.photo.r}px</b></span>
          <input
            type="range" min={80} max={400} step={10}
            value={config.photo.r}
            onChange={(e) => onChange({ ...config, photo: { ...config.photo, r: Number(e.target.value) } })}
            className="flex-1 accent-indigo-600"
          />
        </div>
      </div>
    </div>
  );
}