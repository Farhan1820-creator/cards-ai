// lib/api-auth.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

// ✅ API Route Handlers ke liye — kabhi redirect() throw nahi karta,
// warna try/catch wale routes mein ye galti se generic 500 ban jaata hai
// (redirect() ka thrown error "Unauthorized" message nahi carry karta)
export async function requireUserApi() {
  const session = await getAuthSession();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user: session.user };
}

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