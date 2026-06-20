import { v2 as cloudinary } from "cloudinary";

// ── CONFIG (run once safely) ───────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── UPLOAD ─────────────────────────────────────────────────
export async function uploadBase64Image(
  base64: string,
  folder = "cards-ai"
) {
  const res = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "image",
  });

  return {
    url: res.secure_url,
    publicId: res.public_id,
  };
}

// ── DELETE ─────────────────────────────────────────────────
export async function deleteCloudinaryImage(publicId: string) {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId);
}

// ── EXTRACT PUBLIC ID FROM URL (fallback helper) ───────────
export function extractCloudinaryPublicId(imageUrl: string): string | null {
  try {
    const uploadIndex = imageUrl.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const path = imageUrl.slice(uploadIndex + 8); // after "/upload/"
    const withoutVersion = path.replace(/^v\d+\//, "");
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, "");

    return withoutExtension;
  } catch {
    return null;
  }
}