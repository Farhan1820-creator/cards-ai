"use client";
import { Sparkles, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function DashboardHeader() {
  const handleLogout = async () => {
  await signOut({
    callbackUrl: "/login",
  });
};
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={"/dashboard"} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Cards AI</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/my-cards"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            My Cards
          </Link>
          <a
            href="#"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Templates
          </a>
          <div className="ml-2 h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="ml-2 gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
