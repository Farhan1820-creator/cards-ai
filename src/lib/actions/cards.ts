// lib/actions/cards.ts
import "server-only";
import { db } from "@/db";
import { cards, users } from "@/db/schema";
import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { deleteCloudinaryImage, extractCloudinaryPublicId } from "../cloudinary";

export async function createCard(data: {
  userId: string;
  imageUrl: string;
  recipientName?: string;
  message?: string;
  prompt?: string;
  templateId: string;
  categoryId: string;
  nameColor?: string;
  messageColor?: string;
  photoUrl?: string; // already-uploaded Cloudinary URL (caller resolves this)
  photoTransform?: { scale: number; offsetX: number; offsetY: number };
}) {
  const [card] = await db
    .insert(cards)
    .values({
      id: nanoid(),
      userId: data.userId,
      imageUrl: data.imageUrl,
      templateId: data.templateId,
      categoryId: data.categoryId,
      recipientName: data.recipientName,
      message: data.message,
      prompt: data.prompt ?? "",
      nameColor: data.nameColor,
      messageColor: data.messageColor,
      photoUrl: data.photoUrl,
      photoTransform: data.photoTransform,
    })
    .returning();

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
      recipientName: cards.recipientName,
      message: cards.message,
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

  // photoUrl bhi cleanup karo agar Cloudinary URL hai
  if (card.photoUrl) {
    const photoPublicId = extractCloudinaryPublicId(card.photoUrl);
    if (photoPublicId) await deleteCloudinaryImage(photoPublicId);
  }

  await db.delete(cards).where(eq(cards.id, cardId));
  return true;
}