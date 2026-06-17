import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // 🚫 banned users everywhere blocked
    if (token?.isBanned) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 🔐 admin-only routes
    const adminOnlyRoutes = ["/users"];

    const isAdminRoute = adminOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminRoute && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
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