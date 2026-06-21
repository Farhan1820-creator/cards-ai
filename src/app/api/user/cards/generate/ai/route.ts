import { NextRequest, NextResponse } from "next/server";
import { composeImagePrompt } from "@/lib/prompt-composer";
import { generateImage } from "@/lib/huggingface";
import { createCard } from "@/lib/actions/cards";
import { requireUser } from "@/lib/require-user";
import { uploadBase64Image } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
    try {
        const user = await requireUser();
        const body = await request.json();
        const {
            cardType,
            recipientName,
            templateId,
            style,
            colorTheme,
            primaryColor,
            secondaryColor,
            accentColor,
            prompt,
            customCardTitle,
            customOccasion,
            tone,
            includeCustomMessage,
            customMessageText,
            nameColor,
            messageColor,     
            photoUrl,         
            photoTransform,
            categoryId,
        } = body;
        // Compose the full image prompt
        const finalPrompt = composeImagePrompt({
            cardType,
            recipientName,
            style,
            colorTheme,
            primaryColor,
            secondaryColor,
            accentColor,
            prompt,
            customCardTitle,
            customOccasion,
            tone,
            includeCustomMessage,
            customMessageText,
        });
        // Generate the image using Huggingface
        const base64Image = await generateImage(finalPrompt);

        // Upload the image to Cloudinary
        const uploadResponse = await uploadBase64Image(base64Image);
        const imageUrl = uploadResponse.url;
        
        // Save the card details in the database
        const card = await createCard({
            userId: user.id,
            categoryId,
            imageUrl,
            prompt: finalPrompt,
            recipientName,
            templateId,
            nameColor:      nameColor      ?? "#ffffff",
            messageColor:   messageColor   ?? "#ffffff",
            photoUrl:       photoUrl       ?? "",
            photoTransform: photoTransform ?? null,
        });

        return NextResponse.json(
            {
                success: true,
                card,
            },
            { status: 200 }
        );
        
    }catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save card" },
      { status: 500 }
    );
  }
}