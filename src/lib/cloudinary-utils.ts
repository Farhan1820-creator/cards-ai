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
