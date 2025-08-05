import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ["/dashboard", "/orders", "/profile"];
  const authRoutes = ["/auth"];

  const pathname = request.nextUrl.pathname;
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  console.log("Middleware - Path:", pathname);
  console.log("Middleware - Token exists:", !!token);
  console.log("Middleware - Token value:", token ? token.substring(0, 20) + "..." : "none");
  console.log("Middleware - All cookies:", request.cookies.getAll());

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth-only (redirect to home if already authenticated)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      console.log("Middleware - Redirecting to auth (no token)");
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      console.log("Middleware - Attempting to verify token...");
      const user = await verifyToken(token);
      if (!user) {
        console.log("Middleware - Redirecting to auth (invalid token)");
        return NextResponse.redirect(new URL("/auth", request.url));
      }
      console.log("Middleware - Valid token for user:", user.email);
    } catch (error) {
      console.log("Middleware - Token verification error:", error);
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  if (isAuthRoute && token) {
    try {
      const user = await verifyToken(token);
      if (user) {
        console.log("Middleware - Redirecting to home (already authenticated)");
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.log("Middleware - Auth route token error:", error);
    }
  }

  console.log("Middleware - Allowing request");
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*", "/profile/:path*", "/auth", "/debug"],
};
