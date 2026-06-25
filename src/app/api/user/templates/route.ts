// src/app/api/user/templates/route.ts
import { NextResponse } from "next/server";
import { getUserTemplates } from "@/lib/actions/templates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;

  try {
    const result = await getUserTemplates(categoryId);

    const templates = result.map((t) => ({
      id: t.id,
      name: t.name,
      categoryId: t.categoryId,
      category: t.category,
      imageUrl: t.imageUrl,
      overlayConfig: t.overlayConfig ?? undefined,
    }));

return NextResponse.json(templates, {
  headers: {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
  },
});
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}