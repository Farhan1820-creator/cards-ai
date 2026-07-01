// app/api/user/cards/generate/template/route.ts
import { NextResponse } from "next/server";
import { createCard } from "@/lib/actions/cards";
import { requireUser } from "@/lib/require-user";
import { uploadBase64Image } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();

  // ── card image aur user photo dono ek sath upload karo (sequential nahi) ──
  const [{ url: imageUrl }, photoUrl] = await Promise.all([
    uploadBase64Image(body.image, `cards-ai/cards/${user.id}`),
    body.photoUrl?.startsWith("data:image")
      ? uploadBase64Image(body.photoUrl, `cards-ai/user-photos/${user.id}`).then((r) => r.url)
      : Promise.resolve(body.photoUrl),
  ]);

  const card = await createCard({
    userId: user.id,
    imageUrl,
    recipientName: body.recipientName,
    message: body.message,
    prompt: body.message,
    templateId: body.templateId,
    categoryId: body.categoryId,
    nameColor: body.nameColor,
    messageColor: body.messageColor,
    photoUrl,
    photoTransform: body.photoTransform,
  });

  return NextResponse.json({ success: true, card });
}