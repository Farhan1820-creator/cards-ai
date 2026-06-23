import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Ban check — token mein already isBanned hai (JWT se aata hai)
    if (token?.isBanned) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin-only routes
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
    "/generate/:path*",
    "/create/:path*",
    "/users/:path*",
    "/api/user/:path*",
    "/api/generate/:path*",
    "/api/templates/:path*",
    "/api/admin/:path*",
  ],
};