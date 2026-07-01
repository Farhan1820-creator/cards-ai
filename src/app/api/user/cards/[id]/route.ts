import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteCloudinaryImage, uploadBase64Image, extractCloudinaryPublicId } from "@/lib/cloudinary";


export const GET = (
  async (_req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const user = await requireUser();
      const { id: cardId } = await context.params;

      const [card] = await db
        .select()
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)));

      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      return NextResponse.json({ card });
    } catch (error) {
      console.error("Get card error:", error);
      return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
    }
  }
);

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: cardId } = await context.params;

    const [card] = await db
      .select()
      .from(cards)
      .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)));

    if (!card) return NextResponse.json({ success: false }, { status: 404 });

    const publicId = extractCloudinaryPublicId(card.imageUrl);
    if (publicId) await deleteCloudinaryImage(publicId);

    await db.delete(cards).where(and(eq(cards.id, cardId), eq(cards.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete card error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to delete card" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: cardId } = await context.params;

    const [existing] = await db
      .select()
      .from(cards)
      .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)));

    if (!existing) return NextResponse.json({ success: false }, { status: 404 });

    const body = await req.json();
    const { image, recipientName, message, nameColor, messageColor, photoUrl, templateId, photoTransform, categoryId } = body;

    // ── Image + photo update — dono ek sath upload (sequential nahi) ──
    if (image && image.startsWith("data:")) {
      const publicId = extractCloudinaryPublicId(existing.imageUrl);
      if (publicId) deleteCloudinaryImage(publicId); // background — save ko block nahi karna
    }

    const [imageUrl, resolvedPhotoUrl] = await Promise.all([
      image && image.startsWith("data:")
        ? uploadBase64Image(image, `cards-ai/cards/${user.id}`).then((r) => r.url)
        : Promise.resolve(existing.imageUrl),
      photoUrl?.startsWith("data:image")
        ? uploadBase64Image(photoUrl, `cards-ai/user-photos/${user.id}`).then((r) => r.url)
        : Promise.resolve(photoUrl ?? existing.photoUrl),
    ]);

    const newTemplateId = templateId ?? existing.templateId;

    const [updated] = await db
      .update(cards)
      .set({
        imageUrl,
        templateId:    newTemplateId,
        categoryId:    categoryId     ?? existing.categoryId,
        recipientName: recipientName  ?? existing.recipientName,
        message:       message        ?? existing.message,
        nameColor:     nameColor      ?? existing.nameColor,
        messageColor:  messageColor   ?? existing.messageColor,
        photoUrl:      resolvedPhotoUrl,
        photoTransform: photoTransform ?? existing.photoTransform,
      })
      .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)))
      .returning();

    return NextResponse.json({ success: true, card: updated });
  } catch (error) {
    console.error("Edit card error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to update card" }, { status: 500 });
  }
}