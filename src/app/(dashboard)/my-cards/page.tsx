import { Suspense } from "react";
import { MyCardsSkeleton } from "./MyCardsSkeleton";
import { MyCardsContent } from "./MyCardsContent";

export default async function MyCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user: userParam } = await searchParams;

  return (
    <main className="mx-auto  px-4 py-8 sm:px-6">
      <Suspense fallback={<MyCardsSkeleton count={10} />}>
        <MyCardsContent userParam={userParam ?? ""} />
      </Suspense>
    </main>
  );
}