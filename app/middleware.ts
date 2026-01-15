import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // 1. Define Route Constants
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // 2. Allow API routes to handle their own auth (usually via decorators or wrappers)
  if (isApiRoute) return NextResponse.next();

  // 3. Handle Auth Pages (Login/Register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 4. Protect Admin Routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      // Redirect to login and save the destination for a callback
      const signInUrl = new URL("/auth/signin", nextUrl);
      signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== "ADMIN") {
      // Logged in but not an admin
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
