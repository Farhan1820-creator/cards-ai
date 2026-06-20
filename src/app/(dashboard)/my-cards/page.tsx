import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { cards, users, templates, categories } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { MyCardsClient } from "@/app/(dashboard)/my-cards/MyCardsClient";
import { MyCardsSkeleton } from "./MyCardsSkeleton";
import { Suspense } from "react";

export default async function MyCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user: userParam } = await searchParams;

  // 🔐 SINGLE SOURCE OF TRUTH
  const user = await requireUser();

  const rawCards = user.isAdmin
    ? await db
        .select({
          id: cards.id,
          imageUrl: cards.imageUrl,
          categoryName: categories.name,
          recipientName: cards.recipientName,
          prompt: cards.prompt,
          createdAt: cards.createdAt,
          templateId: cards.templateId,
          nameColor: cards.nameColor,
          messageColor: cards.messageColor,
          photoUrl: cards.photoUrl,
          createdByName: users.name,
          createdByEmail: users.email,
        })
        .from(cards)
        .leftJoin(users, eq(cards.userId, users.id))
        .leftJoin(templates, eq(cards.templateId, templates.id))
        .leftJoin(categories, eq(templates.categoryId, categories.id))
        .orderBy(desc(cards.createdAt))
    : await db
        .select({
          id: cards.id,
          imageUrl: cards.imageUrl,
          categoryName: categories.name,
          recipientName: cards.recipientName,
          prompt: cards.prompt,
          createdAt: cards.createdAt,
          templateId: cards.templateId,
          nameColor: cards.nameColor,
          messageColor: cards.messageColor,
          photoUrl: cards.photoUrl,
          createdByName: sql<string | null>`NULL`,
          createdByEmail: sql<string | null>`NULL`,
        })
        .from(cards)
        .leftJoin(templates, eq(cards.templateId, templates.id))
        .leftJoin(categories, eq(templates.categoryId, categories.id))
        .where(eq(cards.userId, user.id))
        .orderBy(desc(cards.createdAt));

  const formattedCards = rawCards.map((card) => ({
    id: card.id,
    imageUrl: card.imageUrl,
    categoryName: card.categoryName ?? "Uncategorized",
    recipientName: card.recipientName ?? "",
    prompt: card.prompt ?? "",

    createdAt: card.createdAt
      ? new Date(card.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",

    createdAtRaw: card.createdAt
      ? new Date(card.createdAt).toISOString().split("T")[0]
      : "",

    templateId: card.templateId ?? "",
    nameColor: card.nameColor ?? "#ffffff",
    messageColor: card.messageColor ?? "#ffffff",
    photoUrl: card.photoUrl ?? "",

    createdByName: card.createdByName ?? "",
    createdByEmail: card.createdByEmail ?? "",
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Suspense fallback={<MyCardsSkeleton count={10} />}>
        <MyCardsClient
          cards={formattedCards}
          isAdmin={user.isAdmin}
          currentUserEmail={user.email ?? ""}
          initialUser={userParam ?? ""}
        />
      </Suspense>
    </main>
  );
}