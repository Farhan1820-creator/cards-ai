"use client";

import { Check, X, ZoomIn, ZoomOut, Move } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";

export interface PhotoTransform {
  scale:   number;
  offsetX: number;
  offsetY: number;
}

interface PanZoomAdjusterProps {
  photoUrl:         string;
  initialTransform: PhotoTransform;
  onConfirm:        (t: PhotoTransform) => void;
  onClose:          () => void;
  /** Canvas photo circle radius — must match PHOTO_R in TemplatePreview */
  photoR:           number;
}

const MIN_ZOOM     = 0.5;
const MAX_ZOOM     = 3.0;
const ZOOM_STEP    = 0.1;
const PREVIEW_SIZE = 260; // preview circle diameter in CSS-px

function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 28, height: 28, borderRadius: 8,
    border:     "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color:      disabled ? "rgba(255,255,255,0.2)" : "#fff",
    cursor:     disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
  };
}

function actionBtnStyle(type: "cancel" | "confirm"): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 5,
    padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border:     type === "cancel" ? "1px solid rgba(255,255,255,0.2)" : "none",
    background: type === "cancel" ? "transparent" : "linear-gradient(135deg,#22c55e,#16a34a)",
    color:      "#fff",
    boxShadow:  type === "confirm" ? "0 4px 12px rgba(34,197,94,0.3)" : "none",
  };
}

export function PanZoomAdjuster({
  photoUrl,
  initialTransform,
  onConfirm,
  onClose,
  photoR,
}: PanZoomAdjusterProps) {

  // ─── State ────────────────────────────────────────────────────
  // All pan/offset values are stored in CANVAS-SPACE (same as offsetX/offsetY).
  // This means onConfirm passes them straight through — no conversion bugs.
  const [zoom,      setZoom]      = useState(initialTransform.scale);
  const [offsetX,   setOffsetX]   = useState(initialTransform.offsetX);
  const [offsetY,   setOffsetY]   = useState(initialTransform.offsetY);
  const [imgEl,     setImgEl]     = useState<HTMLImageElement | null>(null);

  // Preview canvas ref — we draw on it exactly like TemplatePreview does
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging       = useRef(false);
  const lastPos          = useRef({ x: 0, y: 0 });

  // ─── Load image once ──────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImgEl(img);
    img.src = photoUrl;
  }, [photoUrl]);

  // ─── Draw preview canvas ──────────────────────────────────────
  // This is the EXACT same math as TemplatePreview canvas render,
  // just scaled to PREVIEW_SIZE instead of PHOTO_R*2.
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !imgEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const D    = PREVIEW_SIZE;                                         // preview circle diameter
    const base = Math.max(D / imgEl.naturalWidth, D / imgEl.naturalHeight); // cover
    const fs   = base * zoom;                                          // final scale
    const sw   = imgEl.naturalWidth  * fs;
    const sh   = imgEl.naturalHeight * fs;

    // offsetX/offsetY are in canvas-space → scale to preview-space
    const canvasDiameter = photoR * 2;
    const previewScale   = D / canvasDiameter;  // how preview-px maps to canvas-px
    const px = offsetX * previewScale;
    const py = offsetY * previewScale;

    const dx = D / 2 - sw / 2 + px;
    const dy = D / 2 - sh / 2 + py;

    canvas.width  = D;
    canvas.height = D;
    ctx.clearRect(0, 0, D, D);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(D / 2, D / 2, D / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(imgEl, dx, dy, sw, sh);
    ctx.restore();
  }, [imgEl, zoom, offsetX, offsetY, photoR]);

  // ─── Clamping in canvas-space ─────────────────────────────────
  const clampOffset = useCallback((cx: number, cy: number, z: number) => {
    // At a given zoom, max canvas-space offset = (photoR) * (z - 0.5) * 2 ... 
    // More precisely: the image covers the circle at z=1.
    // Max pan = half the "overhang" on each side.
    // overhang (canvas-px) = (naturalDim * base * z - D) / 2  where D = photoR*2
    // We don't have naturalSize here easily, so use a generous bound:
    // Allow panning up to photoR * z in each direction (feels natural)
    const maxC = photoR * z;
    return {
      x: Math.max(-maxC, Math.min(maxC, cx)),
      y: Math.max(-maxC, Math.min(maxC, cy)),
    };
  }, [photoR]);

  // ─── Pointer events ───────────────────────────────────────────
  // Pointer moves in CSS-px → convert to canvas-px
  const cssToCanvas = (photoR * 2) / PREVIEW_SIZE;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current    = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = (e.clientX - lastPos.current.x) * cssToCanvas;
    const dy = (e.clientY - lastPos.current.y) * cssToCanvas;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffsetX((ox) => {
      const nx = ox + dx;
      return clampOffset(nx, 0, zoom).x;
    });
    setOffsetY((oy) => {
      const ny = oy + dy;
      return clampOffset(0, ny, zoom).y;
    });
  };

  const handlePointerUp = () => { isDragging.current = false; };



  const handleZoomIn = () =>
    setZoom((z) => {
      const nz = Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2)));
      setOffsetX((ox) => clampOffset(ox, 0, nz).x);
      setOffsetY((oy) => clampOffset(0, oy, nz).y);
      return nz;
    });

  const handleZoomOut = () =>
    setZoom((z) => {
      const nz = Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2)));
      setOffsetX((ox) => clampOffset(ox, 0, nz).x);
      setOffsetY((oy) => clampOffset(0, oy, nz).y);
      return nz;
    });

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nz = parseFloat(e.target.value);
    setZoom(nz);
    setOffsetX((ox) => clampOffset(ox, 0, nz).x);
    setOffsetY((oy) => clampOffset(0, oy, nz).y);
  };

  const handleConfirm = () =>
    onConfirm({ scale: zoom, offsetX, offsetY });

  const zoomPercent = Math.round(zoom * 100);
  // Display offsets in preview-px for human readability
  const displayX = Math.round(offsetX / cssToCanvas);
  const displayY = Math.round(offsetY / cssToCanvas);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

      {/* ── Preview circle — uses a real canvas with identical drawImage math ── */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          width: PREVIEW_SIZE, height: PREVIEW_SIZE,
          borderRadius: "50%", overflow: "hidden",
          cursor: "grab",
          position: "relative", touchAction: "none", flexShrink: 0,
          boxShadow: "0 0 0 3px rgba(255,255,255,0.25), 0 0 0 6px rgba(255,255,255,0.08)",
        }}
      >
        {!imgEl && (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.3)", fontSize: 11,
          }}>Loading…</div>
        )}
        <canvas
          ref={previewCanvasRef}
          style={{
            width:  PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            display: imgEl ? "block" : "none",
          }}
        />
      </div>

      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 10, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
        <Move size={10} /> Drag to reposition · Scroll or pinch to zoom
      </p>

      {/* ── Zoom controls ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: PREVIEW_SIZE, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
          <span style={{ fontWeight: 600, letterSpacing: "0.04em" }}>ZOOM</span>
          <span style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6, padding: "2px 8px", fontWeight: 700,
            fontVariantNumeric: "tabular-nums", minWidth: 50, textAlign: "center",
          }}>
            {zoomPercent}%
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, width: PREVIEW_SIZE }}>
          <button onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} style={iconBtnStyle(zoom <= MIN_ZOOM)} title="Zoom out">
            <ZoomOut size={14} />
          </button>

          <div style={{ flex: 1, position: "relative", height: 20, display: "flex", alignItems: "center" }}>
            <div style={{
              position: "absolute", left: 0, height: 3,
              width: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%`,
              background: "linear-gradient(90deg,#22c55e,#16a34a)",
              borderRadius: 99, pointerEvents: "none",
            }} />
            <input
              type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} value={zoom}
              onChange={handleSliderChange}
              style={{ width: "100%", cursor: "pointer", accentColor: "#22c55e", background: "transparent" }}
            />
          </div>

          <button onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM} style={iconBtnStyle(zoom >= MAX_ZOOM)} title="Zoom in">
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Readouts */}
        <div style={{ display: "flex", gap: 6, width: PREVIEW_SIZE }}>
          {([
            { label: "X offset", value: displayX, unit: "px" },
            { label: "Y offset", value: displayY, unit: "px" },
          ] as const).map(({ label, value, unit }) => (
            <div key={label} style={{
              flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "5px 10px", textAlign: "center",
            }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {value > 0 ? "+" : ""}{value}
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginLeft: 1 }}>{unit}</span>
              </div>
            </div>
          ))}
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "5px 10px", textAlign: "center",
          }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.05em", marginBottom: 2 }}>Zoom</div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {zoomPercent}<span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginLeft: 1 }}>%</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); }}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.5)", borderRadius: 6, fontSize: 10,
            padding: "4px 12px", cursor: "pointer", letterSpacing: "0.05em",
          }}
        >
          Reset position
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onClose}       style={actionBtnStyle("cancel")}><X     size={13} /> Cancel</button>
        <button onClick={handleConfirm} style={actionBtnStyle("confirm")}><Check size={13} /> Apply</button>
      </div>
    </div>
  );
}