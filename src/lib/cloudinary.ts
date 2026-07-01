import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export class CloudinaryUploadError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "CloudinaryUploadError";
  }
}

export async function uploadBase64Image(base64: string, folder = "cards-ai") {
  if (!base64?.startsWith("data:image")) {
    throw new CloudinaryUploadError("Invalid image data");
  }

  try {
    const res = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: "image",
      timeout: 30000, // ✅ hard timeout — warna slow connection pe request hang hota tha
      transformation: [
        { quality: "auto:good", fetch_format: "auto" },
        { width: 800, crop: "limit" },
      ],
    });

    return { url: res.secure_url, publicId: res.public_id };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw new CloudinaryUploadError("Image upload failed", err);
  }
}

export async function deleteCloudinaryImage(publicId: string) {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
    return null; // ✅ delete fail ho toh bhi card delete flow block nahi hona chahiye
  }
}

export function extractCloudinaryPublicId(imageUrl: string): string | null {
  try {
    const uploadIndex = imageUrl.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    const path = imageUrl.slice(uploadIndex + 8);
    const withoutVersion = path.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}