// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, ilike, or } from "drizzle-orm";

export async function GET(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page   = parseInt(searchParams.get("page") ?? "1");
  const limit  = parseInt(searchParams.get("limit") ?? "20");
  const offset = (page - 1) * limit;

  const where = search
    ? or(
        ilike(users.email, `%${search}%`),
        ilike(users.name,  `%${search}%`)
      )
    : undefined;

  const allUsers = await db
    .select({
      id:        users.id,
      name:      users.name,
      email:     users.email,
      image:     users.image,
      isAdmin:   users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ users: allUsers });
}