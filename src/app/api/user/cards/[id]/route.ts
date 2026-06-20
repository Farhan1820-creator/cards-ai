import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { cards, categories, templates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteCloudinaryImage, uploadBase64Image } from "@/lib/cloudinary";
import { extractCloudinaryPublicId } from "@/lib/cloudinary-utils";


export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: cardId } = await context.params;

    // .select() mein koi field restrict mat karein, taake saara data (imageUrl, cardType, nameColor, etc.) aa jaye
    const [card] = await db
      .select() 
      .from(cards)
      .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)));

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    
    // Frontend ko { card: {...} } format mein data bhejein
    return NextResponse.json({ card });
    
  } catch (error) {
    console.error("Get card error:", error);
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
  }
}

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
    const { image, recipientName, message, nameColor, messageColor, photoUrl, templateId, photoTransform } = body;
    // ✅ cardType body se nahi lena — DB se derive karenge

    // ── Image update ─────────────────────────────────────────
    let imageUrl: string = existing.imageUrl; // ✅ string type explicit
    if (image && image.startsWith("data:")) {
      const publicId = extractCloudinaryPublicId(existing.imageUrl);
      if (publicId) await deleteCloudinaryImage(publicId);
const uploaded = await uploadBase64Image(image, `cards-ai/cards/${user.id}`);
imageUrl = uploaded.url;
    }

    // ── cardType: templateId change hua toh re-derive karo ───
    let cardType = existing.cardType;
    const newTemplateId = templateId ?? existing.templateId;
    if (templateId && templateId !== existing.templateId) {
      const template = await db
        .select({ categoryName: categories.name })
        .from(templates)
        .leftJoin(categories, eq(templates.categoryId, categories.id))
        .where(eq(templates.id, templateId))
        .then((rows) => rows[0]);
      cardType = template?.categoryName ?? existing.cardType;
    }

    const [updated] = await db
      .update(cards)
      .set({
        imageUrl,
        cardType,                                          // ✅ derived
        templateId:    newTemplateId,
        recipientName: recipientName  ?? existing.recipientName,
        message:       message        ?? existing.message,        // ✅ prompt nahi message
        nameColor:     nameColor      ?? existing.nameColor,
        messageColor:  messageColor   ?? existing.messageColor,
        photoUrl:      photoUrl       ?? existing.photoUrl,
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