import { useCallback, useEffect, useRef, useState } from "react";

export interface CanvasElement {
  key: string;
  cx:  number;
  cy:  number;
  r:   number;
}

export interface DOMElement {
  key:    string;
  left:   number;
  top:    number;
  size:   number;
  radius: number;
}

interface UseCanvasCoordsOptions {
  canvasW:  number;
  canvasH:  number;
  elements: CanvasElement[];
}

interface UseCanvasCoordsReturn {
  ref:        (node: HTMLDivElement | null) => void;
  domElements: Map<string, DOMElement>;
}

export function useCanvasCoords({
  canvasW,
  canvasH,
  elements,
}: UseCanvasCoordsOptions): UseCanvasCoordsReturn {
  const [domElements, setDomElements] = useState<Map<string, DOMElement>>(new Map());
  const roRef = useRef<ResizeObserver | null>(null);

  const calculate = useCallback(
    (width: number, height: number) => {
      if (width === 0 || height === 0) return;
      const scaleX = width  / canvasW;
      const scaleY = height / canvasH;
      const next   = new Map<string, DOMElement>();
      for (const el of elements) {
        const radius = el.r * scaleX;
        next.set(el.key, {
          key:    el.key,
          left:   el.cx * scaleX,
          top:    el.cy * scaleY,
          size:   radius * 2,
          radius,
        });
      }
      setDomElements(next);
    },
    [canvasW, canvasH, elements],
  );

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      roRef.current?.disconnect();
      roRef.current = null;

      if (!node) return;

      // Use getBoundingClientRect for accurate rendered size
      const { width, height } = node.getBoundingClientRect();
      calculate(width, height);

      roRef.current = new ResizeObserver(([entry]) => {
        const { width: w, height: h } = entry.contentRect;
        calculate(w, h);
      });
      roRef.current.observe(node);
    },
    [calculate],
  );

  useEffect(() => () => roRef.current?.disconnect(), []);

  return { ref, domElements };
}