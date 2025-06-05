import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Don't run middleware for static files, API routes, or auth pages
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/auth") ||
    req.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow all other pages to pass through
  // We'll handle authentication checks in the individual pages
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
