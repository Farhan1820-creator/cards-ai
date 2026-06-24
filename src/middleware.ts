import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { deletedSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (token?.isBanned) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

 // middleware.ts
if (token?.id) {
  const [blocked] = await db
    .select({ userId: deletedSessions.userId })
    .from(deletedSessions)
    .where(eq(deletedSessions.userId, token.id as string));

  if (blocked) {
    // signout URL pe redirect — NextAuth cookie clear kar dega
    const signOutUrl = new URL("/api/auth/force-signout", req.url);
    signOutUrl.searchParams.set("callbackUrl", "/");
    return NextResponse.redirect(signOutUrl);
  }
}

    const adminOnlyRoutes = ["/users"];
    if (
      adminOnlyRoutes.some((r) => pathname.startsWith(r)) &&
      !token?.isAdmin
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-cards/:path*",
    "/templates/:path*",
    "/create/:path*",
    "/users/:path*",
    "/api/user/:path*",
    "/api/generate/:path*",
    "/api/templates/:path*",
    "/api/admin/:path*",
  ],
};