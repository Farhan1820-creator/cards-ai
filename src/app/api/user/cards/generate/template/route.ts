// app/api/user/cards/generate/template/route.ts
import { NextResponse } from "next/server";
import { uploadCardImage } from "@/lib/cloudinary";
import { createCard } from "@/lib/actions/cards";
import { requireUser } from "@/lib/require-user";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const { url: imageUrl } = await uploadCardImage(body.image, user.id);

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
  } catch (error) {
    console.error("Generate (template) error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to save card" }, { status: 500 });
  }
}
