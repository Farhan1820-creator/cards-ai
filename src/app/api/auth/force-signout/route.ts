import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const response = NextResponse.redirect(new URL(callbackUrl, req.url));

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