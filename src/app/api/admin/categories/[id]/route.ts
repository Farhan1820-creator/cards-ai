// src/app/api/admin/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { updateCategory, deleteCategory } from "@/lib/actions/categories";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
    console.log("PATCH category id:", id); 
  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const updated = await updateCategory(id, name.trim());
    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (_err) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;

  try {
    const result = await deleteCategory(id);

    if (!result.success) {
      return NextResponse.json(
        { error: "Cannot delete category with existing templates" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}