// app/(dashboard)/DashboardChrome.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/app/(dashboard)/DashboardSidebar";
import { PageHeadingWrapper } from "@/app/(dashboard)/PageHeadingWrapper";

interface DashboardUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
}

interface DashboardChromeProps {
  user: DashboardUser;
  children: React.ReactNode;
}

// Ab /generate yahan nahi — kyunki desktop pe sidebar chahiye
const FULLSCREEN_ROUTES: string[] = [];

export function DashboardChrome({ user, children }: DashboardChromeProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFullscreenRoute = FULLSCREEN_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  const [isNavigating, setIsNavigating] = useState(false);
  const currentUrlRef = useRef(`${pathname}?${searchParams.toString()}`);

  useEffect(() => {
    currentUrlRef.current = `${pathname}?${searchParams.toString()}`;
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) return;

      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const isInternal = anchor.origin === window.location.origin;
      const opensNewTab = anchor.target === "_blank";
      const isDownload = anchor.hasAttribute("download");
      if (!isInternal || opensNewTab || isDownload) return;

      const nextUrl = anchor.href.slice(anchor.origin.length);
      if (nextUrl === currentUrlRef.current) return;

      setIsNavigating(true);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (isFullscreenRoute) {
    return <div className="h-screen overflow-hidden bg-background">{children}</div>;
  }

  // /generate route pe check karo
  const isGenerateRoute = pathname?.startsWith("/generate");

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar: desktop pe hamesha show, mobile/tablet pe hide */}
      <div className="hidden md:flex">
        <DashboardSidebar user={user} />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        {/* /generate route pe mobile/tablet header nahi chahiye — optional */}
        {!isGenerateRoute && <PageHeadingWrapper />}

        <main className="flex-1 relative">
          {isNavigating && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-[2px]"
            >
              <Loader2
                className="h-8 w-8 animate-spin text-primary"
                aria-hidden="true"
              />
              <span className="sr-only">Page loading</span>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}