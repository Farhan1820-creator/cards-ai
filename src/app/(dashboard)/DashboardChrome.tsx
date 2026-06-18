"use client";

import { usePathname } from "next/navigation";
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

// Ye routes apna poora viewport khud manage karte hain — sidebar/header chrome nahi chahiye
const FULLSCREEN_ROUTES = ["/generate"];

export function DashboardChrome({ user, children }: DashboardChromeProps) {
  const pathname = usePathname();
  const isFullscreenRoute = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));

  if (isFullscreenRoute) {
    return <div className="h-screen overflow-hidden bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        <PageHeadingWrapper />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}