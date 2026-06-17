import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { cards, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
          cardType: cards.cardType,
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
        .orderBy(desc(cards.createdAt))
    : await db
        .select()
        .from(cards)
        .where(eq(cards.userId, user.id))
        .orderBy(desc(cards.createdAt));

  const formattedCards = rawCards.map((card) => ({
    id: card.id,
    imageUrl: card.imageUrl,
    cardType: card.cardType,
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

    createdByName:
      "createdByName" in card ? (card.createdByName ?? "") : "",
    createdByEmail:
      "createdByEmail" in card ? (card.createdByEmail ?? "") : "",
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