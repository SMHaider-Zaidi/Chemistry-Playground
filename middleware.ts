import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/periodic-table", "/quizzes", "/reactions", "/molecules", "/periodic"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function hasValidSession(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get("chemistry-session");
  const value = sessionCookie?.value?.trim();
  return Boolean(value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (!hasValidSession(request)) {
    const signInUrl = request.nextUrl.clone();
    // FIXED: Changed from '/sign-in' to '/auth' to perfectly align with your app/auth directory
    signInUrl.pathname = "/auth"; 
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/periodic-table",
    "/periodic-table/:path*",
    "/periodic",
    "/periodic/:path*",
    "/quizzes",
    "/quizzes/:path*",
    "/reactions",
    "/reactions/:path*",
    "/molecules",
    "/molecules/:path*",
  ],
};