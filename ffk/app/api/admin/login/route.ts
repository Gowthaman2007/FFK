import { NextResponse } from "next/server";
import { adminCookieOptions, createAdminSessionToken, COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { ok: false, error: "Admin credentials are not configured on the server." },
        { status: 500 }
      );
    }

    if (String(username ?? "") !== expectedUsername || String(password ?? "") !== expectedPassword) {
      return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
    }

    const token = await createAdminSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, adminCookieOptions());
    return res;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ ok: false, error: "Unable to sign in." }, { status: 500 });
  }
}
