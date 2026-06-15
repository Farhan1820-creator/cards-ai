export function generateCardFilename(
  cardType: string,
  recipientName?: string
) {
  const safeType = cardType
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const safeName = recipientName
    ? recipientName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    : "card";

  return `${safeType}-${safeName}.png`;
}
