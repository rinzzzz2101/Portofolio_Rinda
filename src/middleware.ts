import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("dummy_auth");

  // Jika mencoba mengakses rute dashboard tetapi belum login (cookie tidak ada)
  if (request.nextUrl.pathname.startsWith("/dashboard") && !authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika sudah login dan mencoba membuka halaman login lagi, redirect ke dashboard
  if (request.nextUrl.pathname.startsWith("/login") && authCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
