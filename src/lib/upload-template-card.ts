// lib/upload-template-card.ts
import { v2 as cloudinary } from "cloudinary";

export async function uploadTemplateCard(base64: string) {
  const res = await cloudinary.uploader.upload(base64, {
    folder: "cards-ai",
  });

  return res.secure_url;
}
