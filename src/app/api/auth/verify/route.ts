// app/api/auth/verify/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ valid: false });

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ valid: !!user });
}