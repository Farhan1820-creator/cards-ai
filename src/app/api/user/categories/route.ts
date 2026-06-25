// src/app/api/user/categories/route.ts
import { NextResponse } from "next/server";
import { getCategoriesForUser } from "@/lib/actions/categories";

export async function GET() {
  const categories = await getCategoriesForUser();
  return NextResponse.json(categories, {
    headers: {
      // 60s browser cache, 300s CDN/Vercel Edge cache
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}