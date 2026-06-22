// src/components/NavigationProgress.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);
  const prevPathname = useRef(pathname);

  // route change complete ho gaya → bar hide
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setIsPending(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // document-level click listener — kisi bhi internal <a> click ko detect karega
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (anchor.target === "_blank") return;

      const url = new URL(href, window.location.origin);
      if (url.pathname === pathname) return; // same page, navigation nahi hoga

      setIsPending(true);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // safety timeout — kabhi pathname change na ho to stuck na rahe
  useEffect(() => {
    if (!isPending) return;
    const t = setTimeout(() => setIsPending(false), 8000);
    return () => clearTimeout(t);
  }, [isPending]);

  if (!isPending) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] overflow-hidden bg-transparent">
      <div className="h-full w-full bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse" />
    </div>
  );
}