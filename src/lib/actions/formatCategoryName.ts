export function formatCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")        // spaces → dash
    .replace(/[^a-z0-9-]/g, ""); // remove special characters
}