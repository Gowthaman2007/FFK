import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (await isValidAdminSession(token)) return NextResponse.next();

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
