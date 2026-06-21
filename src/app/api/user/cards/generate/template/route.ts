// app/api/user/cards/generate/template/route.ts
import { NextResponse } from "next/server";
import { uploadGeneratedCard } from "@/lib/upload-generated-card";
import { createCard } from "@/lib/actions/cards";
import { requireUser } from "@/lib/require-user";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();

  const imageUrl = await uploadGeneratedCard(body.image, user.id);

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
    photoUrl: body.photoUrl,
    photoTransform: body.photoTransform,
  });

  return NextResponse.json({ success: true, card });
}