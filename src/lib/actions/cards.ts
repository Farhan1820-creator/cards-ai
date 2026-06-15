// lib/actions/cards.ts
import "server-only";
import { db } from "@/db";
import { cards, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { extractCloudinaryPublicId } from "@/lib/cloudinary-utils";

interface PhotoTransform {
  scale:   number;
  offsetX: number;
  offsetY: number;
}

// ── Create card ───────────────────────────────────────────────
export async function createCard(data: {
  userId:        string;
  imageUrl:      string;
  prompt:        string;
  cardType:      string;
  recipientName?: string;
  templateId?:   string;
  nameColor?:    string;
  messageColor?: string;
  photoUrl?:     string;
  photoTransform?: PhotoTransform | null;
}) {
  const card = { id: nanoid(), ...data };
  await db.insert(cards).values(card);
  return card;
}

// ── User ke apne cards ────────────────────────────────────────
export async function getUserCards(userId: string) {
  return db
    .select()
    .from(cards)
    .where(eq(cards.userId, userId))
    .orderBy(desc(cards.createdAt));
}

// ── Admin — sab cards with user info ─────────────────────────
export async function getAllCards() {
  const result = await db
    .select({
      id:            cards.id,
      imageUrl:      cards.imageUrl,
      prompt:        cards.prompt,
      cardType:      cards.cardType,
      recipientName: cards.recipientName,
      createdAt:     cards.createdAt,
      userId:        cards.userId,
      userName:      users.name,
      userEmail:     users.email,
    })
    .from(cards)
    .leftJoin(users, eq(cards.userId, users.id))
    .orderBy(desc(cards.createdAt));

  return result.map((c) => ({
    ...c,
    userName: c.userName ?? c.userEmail?.split("@")[0] ?? "Unknown",
  }));
}

export async function deleteCard(cardId: string) {
  const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
  if (!card) return null;

  const publicId = extractCloudinaryPublicId(card.imageUrl);
  if (publicId) await deleteCloudinaryImage(publicId);

  await db.delete(cards).where(eq(cards.id, cardId));
  return true;
}