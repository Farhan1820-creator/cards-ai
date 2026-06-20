// src/app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { getCategoriesWithCount, createCategory } from "@/lib/actions/categories";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const categories = await getCategoriesWithCount();
    return NextResponse.json(categories);
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const created = await createCategory(name.trim());
    return NextResponse.json(created, { status: 201 });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}