import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // ── Banned user → har jagah se login pe bhejo ────────
    if (token?.isBanned) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ── Admin routes → non-admin ko dashboard pe bhejo ──
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/admin")
    ) {
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // token nahi → withAuth khud /login pe redirect kar deta hai
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // user pages
    "/dashboard/:path*",
    "/my-cards/:path*",
    "/templates/:path*",
    "/create/:path*",

    // user API
    "/api/user/:path*",
    "/api/generate/:path*",
    "/api/templates/:path*",

    // admin pages + API
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};