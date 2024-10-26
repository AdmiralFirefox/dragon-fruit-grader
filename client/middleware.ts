import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("idToken")?.value;

  // Redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const response = await fetch(
      `${request.nextUrl.origin}/api/auth/verify-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );

    const { isValid, isAdmin } = await response.json();

    if (!isValid) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Restrict access to admin-only routes
    const isAdminRoute = ["/admin", "/admin/recent_activity"].some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Middleware verification failed:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");

  return response;
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/save_results", "/admin", "/admin/recent_activity"],
};
