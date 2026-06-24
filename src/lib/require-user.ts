// lib/require-user.ts
import { getAuthSession } from "./auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.isBanned) {
    redirect("/login");
  }

  return session.user;
}