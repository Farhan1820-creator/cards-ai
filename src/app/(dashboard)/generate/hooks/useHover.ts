import { useCallback, useRef, useState } from "react";

interface UseHoverReturn<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Lightweight hover-state hook.
 * Returns a ref + event handlers to spread onto any element.
 *
 * Usage:
 *   const { ref, isHovered, ...hoverProps } = useHover<HTMLDivElement>();
 *   <div ref={ref} {...hoverProps}>...</div>
 */
export function useHover<T extends HTMLElement>(): UseHoverReturn<T> {
  const ref                     = useRef<T | null>(null);
  const [isHovered, setHovered] = useState(false);

  const onMouseEnter = useCallback(() => setHovered(true),  []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  return { ref, isHovered, onMouseEnter, onMouseLeave };
}