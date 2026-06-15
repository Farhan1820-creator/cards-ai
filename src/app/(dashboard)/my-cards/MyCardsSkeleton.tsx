// components/my-cards/MyCardsSkeleton.tsx
export function MyCardsSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl overflow-hidden border border-border bg-white shadow-sm"
        >
          <div className="aspect-square w-full bg-muted animate-pulse" />
          <div className="px-3 py-2.5 space-y-1.5">
            <div className="h-2.5 w-3/4 rounded-full bg-muted animate-pulse" />
            <div className="h-2 w-1/2 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}