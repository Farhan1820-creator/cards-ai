// app/api/cards/generated/route.ts
import { NextResponse } from "next/server";
import { uploadTemplateCard } from "@/lib/upload-template-card";
import { createCard } from "@/lib/actions/cards";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();

  const imageUrl = await uploadTemplateCard(body.image);

  const card = await createCard({
    userId: user.id,
    imageUrl,
    cardType: body.cardType,
    recipientName: body.recipientName,
    prompt: body.message,
    templateId: body.templateId,
    nameColor: body.nameColor,
    messageColor: body.messageColor,
    photoUrl: body.photoUrl,
    photoTransform: body.photoTransform,
  });

  return NextResponse.json({ success: true, card });
}
