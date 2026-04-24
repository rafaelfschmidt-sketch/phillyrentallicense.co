import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const action = String(form.get("action") || "");
  const password = String(form.get("password") || "");
  const redirect = String(form.get("redirect") || "/admin/progress");
  const expected = process.env.ADMIN_PASSWORD;

  // Logout
  if (action === "logout") {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.cookies.set("admin_auth", "", { path: "/", maxAge: 0 });
    return res;
  }

  // Login
  if (!expected || password !== expected) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("redirect", redirect);
    url.searchParams.set("error", "bad_password");
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(new URL(redirect, request.url));
  res.cookies.set("admin_auth", expected, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  return res;
}
