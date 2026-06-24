// src/app/api/auth/force-signout/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const response = NextResponse.redirect(new URL(callbackUrl, req.url));

  // NextAuth JWT cookie clear karo manually
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("__Secure-next-auth.session-token"); // production HTTPS pe
  response.cookies.delete("next-auth.csrf-token");
  response.cookies.delete("__Host-next-auth.csrf-token");

  return response;
}