import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { cards, users, categories } from "@/db/schema";
import { eq, desc, sql, asc } from "drizzle-orm";
import { MyCardsClient } from "./MyCardsClient";

export async function MyCardsContent({ userParam }: { userParam: string }) {
  const user = await requireUser();

  const [fetchedCards, allCategories] = await Promise.all([
    user.isAdmin
      ? db
          .select({
            id:             cards.id,
            imageUrl:       cards.imageUrl,
            categoryName:   categories.name,         
            recipientName:  cards.recipientName,
            prompt:         cards.prompt,
            createdAt:      cards.createdAt,
            templateId:     cards.templateId,
            categoryId:     cards.categoryId,
            nameColor:      cards.nameColor,
            messageColor:   cards.messageColor,
            photoUrl:       cards.photoUrl,
            createdByName:  users.name,
            createdByEmail: users.email,
          })
          .from(cards)
          .leftJoin(users, eq(cards.userId, users.id))
          .leftJoin(categories, eq(cards.categoryId, categories.id))
          .orderBy(desc(cards.createdAt))
      : db
          .select({
            id:             cards.id,
            imageUrl:       cards.imageUrl,
            categoryName:   categories.name,           
            recipientName:  cards.recipientName,
            prompt:         cards.prompt,
            createdAt:      cards.createdAt,
            templateId:     cards.templateId,
            categoryId:     cards.categoryId,
            nameColor:      cards.nameColor,
            messageColor:   cards.messageColor,
            photoUrl:       cards.photoUrl,
            createdByName:  sql<string | null>`NULL`,
            createdByEmail: sql<string | null>`NULL`,
          })
          .from(cards)
          .leftJoin(categories, eq(cards.categoryId, categories.id))
          .where(eq(cards.userId, user.id))
          .orderBy(desc(cards.createdAt)),

    db.select({ name: categories.name, slug: categories.slug })
      .from(categories)
      .orderBy(asc(categories.name)),
  ]);

  // ── Format — bilkul same, koi change nahi ─────────────────────
  const formattedCards = fetchedCards.map((card) => ({
    id:             card.id,
    imageUrl:       card.imageUrl,
    categoryName:   card.categoryName ?? "Uncategorized",
    recipientName:  card.recipientName ?? "",
    prompt:         card.prompt ?? "",
    createdAt:      card.createdAt
      ? new Date(card.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "",
    createdAtRaw:   card.createdAt
      ? new Date(card.createdAt).toISOString().split("T")[0]
      : "",
    templateId:     card.templateId ?? "",
    categoryId:     card.categoryId ?? "",
    nameColor:      card.nameColor ?? "#ffffff",
    messageColor:   card.messageColor ?? "#ffffff",
    photoUrl:       card.photoUrl ?? "",
    createdByName:  card.createdByName ?? "",
    createdByEmail: card.createdByEmail ?? "",
  }));

  return (
    <MyCardsClient
      cards={formattedCards}
      isAdmin={user.isAdmin}
      currentUserEmail={user.email ?? ""}
      initialUser={userParam}
      categoryOptions={allCategories}
    />
  );
}