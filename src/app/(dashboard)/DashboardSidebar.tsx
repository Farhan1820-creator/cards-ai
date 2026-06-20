"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FolderOpen, PanelsRightBottom, BlocksIcon, LogOut, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BlocksIcon },
  { label: "Templates", href: "/templates", icon: PanelsRightBottom },
  { label: "My Cards",  href: "/my-cards",  icon: FolderOpen },
];

const adminNavItems = [
  { label: "Users", href: "/users", icon: Users },
];

interface SidebarUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
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
  // Both sizes now match the icon container sizes used in nav
  // "md" = desktop sidebar avatar, "sm" = mobile nav item (same 20px icon size)
  const cls = size === "sm"
    ? "h-5 w-5 text-[8px]"   // matches h-5 w-5 icon in mobile nav
    : "h-9 w-9 text-xs";

  const tooltip = [name, email].filter(Boolean).join("\n");

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        title={tooltip}
        className={`${cls} rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      title={tooltip}
      className={`${cls} rounded-full bg-primary flex items-center justify-center text-white font-bold`}
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
              <p className="text-xs text-muted-foreground truncate">{user.email ?? "No email"}</p>
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

      {/* Mobile — account popover appears above the bottom nav */}
      <div className="md:hidden fixed bottom-[65px] left-1/2 -translate-x-1/2 z-[100] w-56 bg-white rounded-2xl shadow-2xl border border-border p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar image={user.image} name={user.name} email={user.email} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email ?? "No email"}</p>
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
    </>
  );
}

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const extraNavItems = user.isAdmin ? [...navItems, ...adminNavItems] : navItems;

  // All mobile nav items in one flat list — Create + nav items + Account
  const mobileItems = [
    { label: "Create", href: "/generate", icon: Plus, type: "create" as const },
    ...extraNavItems.map((item) => ({ ...item, type: "nav" as const })),
    { label: "Account", href: "__account__", icon: null, type: "account" as const },
  ];

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex h-screen w-[72px] flex-col items-center border-r border-border bg-white py-4 shadow-sm sticky top-0 shrink-0 z-40">

        {/* Create button */}
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
                active ? "text-primary" : "text-muted-foreground"
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
          className="mt-2 rounded-full hover:ring-2 hover:ring-primary transition-all"
        >
          <Avatar image={user.image} name={user.name} email={user.email} />
        </button>

        {popoverOpen && <UserPopover user={user} onClose={() => setPopoverOpen(false)} />}
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      {/*
        Key fixes:
        1. overflow-x-auto + no-scrollbar → scroll karne ki ability agar items zyada hon
        2. Har item ka container fixed width (min-w-[60px]) → equal spacing
        3. Icon container har jagah h-9 w-9 → Create bhi, Account bhi, baaki bhi
        4. Avatar size="sm" → h-5 w-5 jo icon ke saath match karta hai
        5. Create ka special bg sirf icon ke andar, outer container same size
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex overflow-x-auto no-scrollbar px-1 py-2 gap-1">
          {mobileItems.map((item, index) => {
            if (item.type === "account") {
              return (
                <button
                key="account"
  onClick={() => setPopoverOpen((v) => !v)}
  className="flex flex-col items-center justify-center min-w-[72px]"
>
  <div className="h-11 w-11 flex items-center justify-center">
    <Avatar
      image={user.image}
      name={user.name}
      size="md"  
    />
  </div>

  <span className="text-[10px] mt-1 font-medium text-muted-foreground">
    Account
  </span>
</button>
              );
            }

            const Icon = item.icon!;
            const active = pathname === item.href;
            const isCreate = item.type === "create";

            return (
              <Link
                key={item.href}
                href={item.href!}
                className="flex flex-col items-center justify-center min-w-[60px] flex-1"
              >
                {/* Uniform h-9 w-9 container for ALL items */}
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  isCreate
                    ? "bg-primary text-white"
                    : active
                      ? "bg-violet-100 text-primary"
                      : "text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium leading-none",
                  isCreate
                    ? "text-primary"
                    : active
                      ? "text-violet-600"
                      : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {popoverOpen && <UserPopover user={user} onClose={() => setPopoverOpen(false)} />}
    </>
  );
}