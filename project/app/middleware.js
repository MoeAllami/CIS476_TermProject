// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  // Get the user's session token from the cookie
  const session = request.cookies.get("session")?.value;

  // Check if the user is trying to access a protected route
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/cars/new");

  // If it's a protected route and the user isn't logged in, redirect to login
  if (isProtectedRoute && !session) {
    const url = new URL("auth/signin", request.url);
    // Add the original URL as a query parameter so we can redirect back after login
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/dashboard/:path*", "/api/cars/new", "/api/cars/:id/edit"],
};
