// app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { db } from "@/db";
import { users, cards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  if (id === user.id) {
    return NextResponse.json(
      { error: "You cannot modify your own account" },
      { status: 400 }
    );
  }

  const allowed: Partial<{ isAdmin: boolean; isBanned: boolean }> = {};
  if (typeof body.isAdmin  === "boolean") allowed.isAdmin  = body.isAdmin;
  if (typeof body.isBanned === "boolean") allowed.isBanned = body.isBanned;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set(allowed)
    .where(eq(users.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  // ── pehle user ke cards delete karo (foreign key constraint) ──
  await db.delete(cards).where(eq(cards.userId, id));

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}