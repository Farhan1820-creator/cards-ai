// components/PageHeadingWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { PageHeading } from "./PageHeading";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "What will you design today?",
  "/my-cards":  "My Cards",
  "/templates": "Templates",
  "/users": "Users",
};

export function PageHeadingWrapper() {
  const pathname = usePathname();

  // /create pe show mat karo
  if (pathname === "/create" || !PAGE_TITLES[pathname]) return null;
  // if (!PAGE_TITLES[pathname]) return null;

  return <PageHeading title={PAGE_TITLES[pathname]} />;
}