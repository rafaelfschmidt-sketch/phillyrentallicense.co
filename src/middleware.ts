import { updateSession } from "@/lib/supabase-middleware";
import { NextResponse, type NextRequest } from "next/server";

const VALID_VARIANTS = new Set(["control", "v1", "v2"]);

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Admin routes — require ADMIN_PASSWORD cookie.
  // Login page itself is exempt so the user can submit the password.
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/api/admin/login")
  ) {
    const adminCookie = request.cookies.get("admin_auth")?.value;
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || adminCookie !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Root → landing page
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = "/apply/rental-license";
    return NextResponse.rewrite(url);
  }

  // Supabase session refresh (keeps auth tokens fresh if we add auth later)
  const response = await updateSession(request);

  // A/B variant cookie
  //  - Manual override: ?v=control|v1|v2 always wins (QA / preview)
  //  - First-time visitor: randomly assign 33/33/33
  //  - Returning visitor: sticky via 30-day cookie
  const variantParam = searchParams.get("v");
  if (variantParam && VALID_VARIANTS.has(variantParam)) {
    response.cookies.set("lp_variant", variantParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  } else if (!request.cookies.get("lp_variant")) {
    const rand = Math.random();
    const assigned = rand < 1 / 3 ? "control" : rand < 2 / 3 ? "v1" : "v2";
    response.cookies.set("lp_variant", assigned, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  // Static domain tag — this repo only serves phillyrentallicenses.co
  response.cookies.set("lp_domain", "prl", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    // Exclude /api/* so machine-to-machine routes (Vercel Cron hitting
    // /api/cron/keep-alive, webhooks, etc.) bypass the session-refresh
    // step. Without this exclusion, updateSession runs on every API
    // request and silently breaks unauthenticated hits like the cron.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
