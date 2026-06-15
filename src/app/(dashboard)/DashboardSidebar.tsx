"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FolderOpen, Sparkles, PanelsRightBottom, BlocksIcon, LogOut, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { signOut } from "next-auth/react";

// Create ko alag rakhte hain — baaki nav items mein nahi
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BlocksIcon },
  { label: "Templates", href: "/templates", icon: PanelsRightBottom },
  { label: "My Cards",  href: "/my-cards",  icon: FolderOpen },
];

const adminNavItems = [
  { label: "Users", href: "/users", icon: Users },
];

interface SidebarUser {
  name:    string | null;
  email:   string;
  image:   string | null;
  isAdmin?: boolean;
}

function Avatar({
  image, name, email, size = "md",
}: {
  image?: string | null;
  name?:  string | null;
  email?: string | null;
  size?:  "sm" | "md";
}) {
  const initials = name
    ? name.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const cls = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  const tooltip = [name, email].filter(Boolean).join("\n");

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        title={tooltip}
        className={`${cls} rounded-full object-cover border-2 border-violet-200`}
      />
    );
  }
  return (
    <div
      title={tooltip}
      className={`${cls} rounded-full bg-primary flex items-center justify-center text-white font-bold border-2 border-violet-200`}
    >
      {initials}
    </div>
  );
}

function UserPopover({ user, onClose }: { user: SidebarUser; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={onClose} />

      {/* Desktop */}
      <div className="fixed bottom-6 left-[80px] z-[100] w-56 bg-white rounded-2xl shadow-2xl border border-border p-4 hidden md:block">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar image={user.image} name={user.name} email={user.email} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t border-border my-2" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      {/* Mobile */}
      <div className="fixed bottom-20 left-4 right-4 z-[100] bg-white rounded-2xl shadow-2xl border border-border p-4 md:hidden">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar image={user.image} name={user.name} email={user.email} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t border-border my-2" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const pathname  = usePathname();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const extraNavItems = user.isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex h-screen w-[72px] flex-col items-center border-r border-border bg-white py-4 shadow-sm sticky top-0 shrink-0 z-40">

        {/* Logo */}
        {/* <Link href="/dashboard" className="mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md hover:opacity-90 transition-opacity">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </Link> */}

        {/* ── Create button — primary, separated ── */}
        <Link href="/generate" className="mb-6 group flex flex-col items-center gap-1">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 shadow-sm",
            pathname === "/generate"
              ? "bg-primary text-white shadow-primary/40 shadow-md"
              : "bg-primary/90 text-white hover:bg-primary hover:shadow-primary/40 hover:shadow-md"
          )}>
            <Plus className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[10px] font-semibold leading-none",
            pathname === "/generate" ? "text-primary" : "text-primary/80 group-hover:text-primary"
          )}>
            Create
          </span>
        </Link>

        {/* Divider */}
        {/* <div className="w-8 h-px bg-border mb-3" /> */}

        {/* Rest of nav */}
        {extraNavItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="group mb-2 flex flex-col items-center gap-1">
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                active
                  ? "bg-violet-100 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-violet-600" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* Avatar */}
        <button
          onClick={() => setPopoverOpen((v) => !v)}
          className="mt-2 rounded-full hover:ring-2 hover:ring-violet-300 transition-all"
        >
          <Avatar image={user.image} name={user.name} email={user.email} />
        </button>

        {popoverOpen && <UserPopover user={user} onClose={() => setPopoverOpen(false)} />}
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-white px-2 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">

        {/* Left side nav items (first half) */}
        {extraNavItems.slice(0, Math.ceil(extraNavItems.length / 2)).map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                active ? "bg-violet-100 text-violet-600" : "text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-violet-600" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* ── Center FAB — Create ── */}
        <Link
          href="/generate"
          className="relative flex flex-col items-center -mt-5"
        >
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
            pathname === "/generate"
              ? "bg-primary shadow-primary/40"
              : "bg-primary hover:bg-primary/90 shadow-primary/30 hover:shadow-primary/50"
          )}>
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold leading-none text-primary mt-1">
            Create
          </span>
        </Link>

        {/* Right side nav items (second half) */}
        {extraNavItems.slice(Math.ceil(extraNavItems.length / 2)).map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                active ? "bg-violet-100 text-violet-600" : "text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-violet-600" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Account */}
        <button
          onClick={() => setPopoverOpen((v) => !v)}
          className="flex flex-col items-center gap-0.5 px-3 py-1"
        >
          <Avatar image={user.image} name={user.name} size="sm" />
          <span className="text-[10px] font-medium leading-none text-muted-foreground">Account</span>
        </button>

        {popoverOpen && <UserPopover user={user} onClose={() => setPopoverOpen(false)} />}
      </nav>
    </>
  );
}