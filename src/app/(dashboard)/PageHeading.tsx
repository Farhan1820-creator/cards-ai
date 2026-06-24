// components/PageHeading.tsx
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Home } from "lucide-react";

interface PageHeadingProps {
  title: string;
  className?: string;
}

export function PageHeading({ title, className }: PageHeadingProps) {
  return (
    <div className={cn(
      "w-full px-8 py-4 border-b border-border bg-white text-center relative",
      className
    )}>
      <h1
        className="text-2xl font-semibold tracking-tight bg-primary bg-clip-text text-transparent"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        {title}
      </h1>

      <Link
        href="/"
        className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        {/* Mobile/Tablet: icon only */}
        <Home className="h-5 w-5 md:hidden text-primary" />

        {/* Desktop: text link */}
        <span className="hidden md:inline bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-all duration-300">Go to Home</span>
      </Link>
    </div>
  );
}