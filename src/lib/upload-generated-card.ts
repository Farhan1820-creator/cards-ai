// lib/upload-generated-card.ts
import { v2 as cloudinary } from "cloudinary";

export async function uploadGeneratedCard(base64: string, userId: string) {
  const res = await cloudinary.uploader.upload(base64, {
    folder: `cards-ai/cards/${userId}`,
  });

  return res.secure_url;
}