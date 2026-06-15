// src/app/api/user/templates/route.ts
import { NextResponse } from "next/server";
import { getTemplatesByCategory } from "@/lib/actions/templates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json({ error: "Category required" }, { status: 400 });
  }

  try {
    const result = await getTemplatesByCategory(category);
const templates = result.map((t) => ({
  id:            t.id,
  name:          t.name,
  thumbnail:     t.thumbnailUrl ?? t.imageUrl,
  category:      t.category,
  overlayConfig: t.overlayConfig ?? undefined,
}));
    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}