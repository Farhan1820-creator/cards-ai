// lib/require-user.ts
import { getAuthSession } from "./auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { deletedSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.isBanned) {
    redirect("/login");
  }

  // deletedSessions check — yahan karo, middleware mein nahi
  // Server Component mein hai toh DB call bilkul safe hai
  const [blocked] = await db
    .select({ userId: deletedSessions.userId })
    .from(deletedSessions)
    .where(eq(deletedSessions.userId, session.user.id));

  if (blocked) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  return session.user;
}