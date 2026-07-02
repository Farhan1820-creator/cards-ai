// lib/api-auth.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function requireAdminApi() {
  const session = await getAuthSession();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!session.user.isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user: session.user };
}