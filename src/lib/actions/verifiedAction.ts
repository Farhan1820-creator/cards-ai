// lib/verifiedAction.ts
import { signOut } from "next-auth/react";

export async function verifiedAction(action: () => Promise<void>) {
  const res = await fetch("/api/auth/verify");
  const { valid } = await res.json();

  if (!valid) {
    await signOut({ callbackUrl: "/login" });
    return;
  }

  await action();
}