import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (token?.isDeleted) {
      const signOutUrl = new URL("/api/auth/force-signout", req.url);
      signOutUrl.searchParams.set("callbackUrl", "/");
      return NextResponse.redirect(signOutUrl);
    }

    if (token?.isBanned) {
      return NextResponse.redirect(new URL("/login", req.url));
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