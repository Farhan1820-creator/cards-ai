"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "completing">("idle");
  const prevPathname = useRef(pathname);

  // Route change complete → completing state
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setState("completing");
      prevPathname.current = pathname;

      // Completing ke baad hide
      const t = setTimeout(() => setState("idle"), 400);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // Click listener
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (anchor.target === "_blank") return;

      const url = new URL(href, window.location.origin);
      if (url.pathname === pathname) return;

      setState("loading");
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Safety timeout
  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => setState("completing"), 8000);
    return () => clearTimeout(t);
  }, [state]);

  if (state === "idle") return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px]">
      <div
        className={`h-full bg-primary transition-all ease-in-out ${
        state === "loading" ? "w-[75%] duration-[3000ms]" : "w-full duration-300"
        }`}
      />
    </div>
  );
}