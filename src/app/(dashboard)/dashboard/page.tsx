import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { cards, templates, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await requireUser();

  // ── User: recent cards ────────────────────────────────────
  const recentCards = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, user.id))
    .orderBy(desc(cards.createdAt))
    .limit(4);

  const formattedCards = recentCards.map((card) => ({
    id:            card.id,
    imageUrl:      card.imageUrl,
    cardType:      card.cardType,
    recipientName: card.recipientName ?? "",
    prompt:        card.prompt ?? "",
    templateId:    card.templateId ?? "",
    nameColor:     card.nameColor ?? "#ffffff",
    messageColor:  card.messageColor ?? "#ffffff",
    photoUrl:      card.photoUrl ?? "",
    createdAt:     card.createdAt
      ? new Date(card.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "",
  }));

  // ── User stats ────────────────────────────────────────────
  const [userCardCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cards)
    .where(eq(cards.userId, user.id));

  const [templateCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(templates);

  // ── Admin-only data ───────────────────────────────────────
  let adminData = null;
  if (user.isAdmin) {
    const [totalCardCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cards);

    const [totalUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isAdmin, false));

    const recentUsers = await db
      .select({
        name:      users.name,
        email:     users.email,
        image:     users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.isAdmin, false))
      .orderBy(desc(users.createdAt))
      .limit(3);

    adminData = {
      totalCards:     Number(totalCardCount.count),
      totalUsers:     Number(totalUserCount.count),
      totalTemplates: Number(templateCount.count),
      recentUsers:    recentUsers.map((u) => ({
        name:      u.name ?? u.email.split("@")[0],
        email:     u.email,
        image:     u.image ?? null,
        createdAt: u.createdAt ? u.createdAt.toISOString() : "",
      })),
    };
  }

  return (
    <DashboardClient
      userName={user.name ?? ""}
      isAdmin={user.isAdmin}
      recentCards={formattedCards}
      userCardCount={Number(userCardCount.count)}
      totalTemplates={Number(templateCount.count)}
      adminData={adminData}
    />
  );
}