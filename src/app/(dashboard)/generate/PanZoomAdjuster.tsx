"use client";

import { Check, X, ZoomIn, ZoomOut, Move } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

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

const MIN_ZOOM  = 0.5;
const MAX_ZOOM  = 3.0;
const ZOOM_STEP = 0.1;

// ── Responsive preview size ────────────────────────────────────
// Ab viewport ka 55vw ya fixed max — card size se koi lena dena nahi.
function usePreviewSize(): number {
  const [size, setSize] = useState(220);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      // 55vw but clamp between 160px and 260px
      const raw = Math.round(vw * 0.55);
      setSize(Math.min(260, Math.max(160, raw)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return size;
}

// ── Style helpers ──────────────────────────────────────────────
function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
    border:     "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color:      disabled ? "rgba(255,255,255,0.2)" : "#fff",
    cursor:     disabled ? "not-allowed" : "pointer",
  };
}

function actionBtnStyle(type: "cancel" | "confirm"): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 5,
    padding: "9px 20px", borderRadius: 999,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    border:     type === "cancel" ? "1px solid rgba(255,255,255,0.2)" : "none",
    background: type === "cancel" ? "transparent" : "linear-gradient(135deg,#22c55e,#16a34a)",
    color:      "#fff",
    boxShadow:  type === "confirm" ? "0 4px 12px rgba(34,197,94,0.3)" : "none",
  };
}

// ── Inner content (pure logic, no portal awareness) ───────────
function PanZoomContent({
  photoUrl, initialTransform, onConfirm, onClose, photoR,
}: PanZoomAdjusterProps) {
  const previewSize = usePreviewSize();

  const [zoom,    setZoom]    = useState(initialTransform.scale);
  const [offsetX, setOffsetX] = useState(initialTransform.offsetX);
  const [offsetY, setOffsetY] = useState(initialTransform.offsetY);
  const [imgEl,   setImgEl]   = useState<HTMLImageElement | null>(null);

  const previewCanvasRef  = useRef<HTMLCanvasElement>(null);
  const isDragging        = useRef(false);
  const lastPos           = useRef({ x: 0, y: 0 });
  const lastPinchDist     = useRef<number | null>(null);

  // ─── Load image ───────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImgEl(img);
    img.src = photoUrl;
  }, [photoUrl]);

  // ─── Draw canvas ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !imgEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const D            = previewSize;
    const previewScale = D / (photoR * 2);
    const base         = Math.max(D / imgEl.naturalWidth, D / imgEl.naturalHeight);
    const fs           = base * zoom;
    const sw           = imgEl.naturalWidth  * fs;
    const sh           = imgEl.naturalHeight * fs;
    const dx           = D / 2 - sw / 2 + offsetX * previewScale;
    const dy           = D / 2 - sh / 2 + offsetY * previewScale;

    canvas.width  = D;
    canvas.height = D;
    ctx.clearRect(0, 0, D, D);
    ctx.save();
    ctx.beginPath();
    ctx.arc(D / 2, D / 2, D / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(imgEl, dx, dy, sw, sh);
    ctx.restore();
  }, [imgEl, zoom, offsetX, offsetY, photoR, previewSize]);

  // ─── Helpers ──────────────────────────────────────────────────
  const cssToCanvas = (photoR * 2) / previewSize;

  const clampOffset = useCallback((cx: number, cy: number, z: number) => {
    const maxC = photoR * z;
    return {
      x: Math.max(-maxC, Math.min(maxC, cx)),
      y: Math.max(-maxC, Math.min(maxC, cy)),
    };
  }, [photoR]);

  const applyZoom = useCallback((nz: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat(nz.toFixed(2))));
    setZoom(clamped);
    setOffsetX((ox) => clampOffset(ox, 0, clamped).x);
    setOffsetY((oy) => clampOffset(0, oy, clamped).y);
  }, [clampOffset]);

  // ─── Pointer (drag) ───────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    isDragging.current = true;
    lastPos.current    = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !e.isPrimary) return;
    const dx = (e.clientX - lastPos.current.x) * cssToCanvas;
    const dy = (e.clientY - lastPos.current.y) * cssToCanvas;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffsetX((ox) => clampOffset(ox + dx, 0, zoom).x);
    setOffsetY((oy) => clampOffset(0, oy + dy, zoom).y);
  };

  const handlePointerUp = () => { isDragging.current = false; };

  // ─── Touch (pinch zoom) ───────────────────────────────────────
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const [t1, t2] = [e.touches[0], e.touches[1]];
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    if (lastPinchDist.current === null) { lastPinchDist.current = dist; return; }
    const delta = dist - lastPinchDist.current;
    lastPinchDist.current = dist;
    setZoom((z) => {
      const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat((z + delta * 0.005).toFixed(2))));
      setOffsetX((ox) => clampOffset(ox, 0, nz).x);
      setOffsetY((oy) => clampOffset(0, oy, nz).y);
      return nz;
    });
  }, [clampOffset]);

  const handleTouchEnd = () => { lastPinchDist.current = null; };

  const handleReset   = () => { setZoom(1); setOffsetX(0); setOffsetY(0); };
  const handleConfirm = () => onConfirm({ scale: zoom, offsetX, offsetY });

  const zoomPercent = Math.round(zoom * 100);
  const displayX    = Math.round(offsetX / cssToCanvas);
  const displayY    = Math.round(offsetY / cssToCanvas);

  return (
    // Outer: centers everything, full height scroll if needed
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 14, width: "100%",
      padding: "20px 20px 28px",
      boxSizing: "border-box",
    }}>

      {/* Title */}
      <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>
        Adjust Photo
      </p>

      {/* Preview circle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: previewSize, height: previewSize, flexShrink: 0,
          borderRadius: "50%", overflow: "hidden",
          cursor: "grab", position: "relative", touchAction: "none",
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
          style={{ width: previewSize, height: previewSize, display: imgEl ? "block" : "none" }}
        />
      </div>

      {/* Hint */}
      <p style={{
        color: "rgba(255,255,255,0.38)", fontSize: 10, margin: 0,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <Move size={10} /> Drag · Pinch to zoom
      </p>

      {/* Controls */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        width: "100%", maxWidth: previewSize + 40,
      }}>

        {/* Zoom label + badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "rgba(255,255,255,0.7)", fontSize: 11,
        }}>
          <span style={{ fontWeight: 600, letterSpacing: "0.04em" }}>ZOOM</span>
          <span style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6, padding: "2px 8px", fontWeight: 700,
            fontVariantNumeric: "tabular-nums", minWidth: 50, textAlign: "center",
          }}>{zoomPercent}%</span>
        </div>

        {/* Slider row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => applyZoom(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} style={iconBtnStyle(zoom <= MIN_ZOOM)}>
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
              onChange={(e) => applyZoom(parseFloat(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "#22c55e", background: "transparent" }}
            />
          </div>
          <button onClick={() => applyZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} style={iconBtnStyle(zoom >= MAX_ZOOM)}>
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Readouts */}
        <div style={{ display: "flex", gap: 6 }}>
          {([
            { label: "X offset", value: displayX,    unit: "px" },
            { label: "Y offset", value: displayY,    unit: "px" },
            { label: "Zoom",     value: zoomPercent, unit: "%"  },
          ] as const).map(({ label, value, unit }) => (
            <div key={label} style={{
              flex: 1, minWidth: 0,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "5px 6px", textAlign: "center",
            }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {value > 0 ? "+" : ""}{value}
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginLeft: 1 }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Reset */}
        <button onClick={handleReset} style={{
          background: "none", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.5)", borderRadius: 6, fontSize: 10,
          padding: "5px 12px", cursor: "pointer", letterSpacing: "0.05em",
          alignSelf: "center",
        }}>
          Reset position
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onClose}      style={actionBtnStyle("cancel")} ><X     size={13} /> Cancel</button>
        <button onClick={handleConfirm} style={actionBtnStyle("confirm")}><Check size={13} /> Apply</button>
      </div>
    </div>
  );
}

// ── Public export — renders via portal into document.body ─────
// Card ke DOM mein bilkul nahi, full viewport pe apna overlay hai.
export function PanZoomAdjuster(props: PanZoomAdjusterProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    // Backdrop: full-screen, scrollable agar content zyada ho
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflowY: "auto",
        // iOS safari ke liye safe-area respect karo
        paddingTop:    "env(safe-area-inset-top,    0px)",
        paddingBottom: "env(safe-area-inset-bottom, 16px)",
      }}
      // Backdrop click se close
      onPointerDown={(e) => { if (e.target === e.currentTarget) props.onClose(); }}
    >
      <PanZoomContent {...props} />
    </div>,
    document.body,
  );
}