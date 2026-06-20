// src/app/api/user/categories/route.ts
import { NextResponse } from "next/server";
import { getCategoriesForUser } from "@/lib/actions/categories";

export async function GET() {
  const categories = await getCategoriesForUser();
  return NextResponse.json(categories);
}