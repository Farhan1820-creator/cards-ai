// components/PageHeading.tsx
import { cn } from "@/lib/utils";

interface PageHeadingProps {
  title: string;
  className?: string;
}

export function PageHeading({ title, className }: PageHeadingProps) {
  return (
    <div className={cn(
      "w-full px-6 py-4 border-b border-border bg-white text-center",
      className
    )}>
      <h1
        className="text-3xl font-semibold tracking-tight  bg-primary bg-clip-text text-transparent"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        {title}
      </h1>
    </div>
  );
}