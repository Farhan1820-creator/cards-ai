"use client";

import { Crop } from "lucide-react";
import { useState } from "react";
import type { DOMElement } from "./hooks/useCanvasCoords";

interface PhotoOverlayButtonProps {
  domElement: DOMElement;
  onClick:    () => void;
}

export function PhotoOverlayButton({ domElement, onClick }: PhotoOverlayButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const BUTTON_SIZE = 34;

  return (
    <>
      {/*
        Invisible circular hit-area — exactly covers the photo circle.
        This is what detects hover. pointer-events: all so it catches mouse
        even when the crop button is hidden.
      */}
      <div
        aria-hidden="true"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position:      "absolute",
          left:          domElement.left - domElement.radius,
          top:           domElement.top  - domElement.radius,
          width:         domElement.size,
          height:        domElement.size + 40,
          borderRadius:  "50%",
          pointerEvents: "all",
          zIndex:        9,
        //   outline: "2px solid red", // ← uncomment to debug position
        }}
      />

      {/* Crop button — bottom-center of circle, shown on hover */}
      <button
        onClick={onClick}
        aria-label="Adjust photo"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position:       "absolute",
          left:           domElement.left - BUTTON_SIZE / 2,
          top:            domElement.top  + domElement.radius  + 4,
          width:          BUTTON_SIZE,
          height:         BUTTON_SIZE,
          borderRadius:   "50%",
          border:         "1.5px solid rgba(255,255,255,0.4)",
          background:     isHovered ? "rgba(0,0,0,0.80)" : "rgba(0,0,0,0.55)",
          color:          "#fff",
          cursor:         "pointer",
          backdropFilter: "blur(4px)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         10,
          // Fade in/out
          opacity:        isHovered ? 1 : 0,
          pointerEvents:  isHovered ? "auto" : "none",
          transition:     "opacity 0.15s ease, background 0.15s ease",
        }}
      >
        <Crop size={15} />
      </button>
    </>
  );
}