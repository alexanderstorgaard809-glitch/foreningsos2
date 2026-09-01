import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "fos_session";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    (pathname === "/login" || pathname === "/signup" || pathname === "/join") &&
    hasSession
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/join"],
};
