import { db } from "@/db";
import { deletedSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const response = NextResponse.redirect(new URL(callbackUrl, req.url));

  if (token?.sub) {
    await db.delete(deletedSessions).where(eq(deletedSessions.userId, token.sub));
  }

  const cookiesToClear = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, "", {
      expires: new Date(0),
      path: "/",
    });
  });

  return response;
}