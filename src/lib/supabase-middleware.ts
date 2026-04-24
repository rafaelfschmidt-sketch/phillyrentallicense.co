import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth failed — treat as unauthenticated
  }

  // PROTOTYPE MODE: Auth wall disabled for demo/sharing purposes.
  // Re-enable the block below before going to production.
  //
  // const isInternalRoute =
  //   !request.nextUrl.pathname.startsWith("/apply") &&
  //   !request.nextUrl.pathname.startsWith("/legal") &&
  //   !request.nextUrl.pathname.startsWith("/login") &&
  //   !request.nextUrl.pathname.startsWith("/auth") &&
  //   !request.nextUrl.pathname.startsWith("/api") &&
  //   !request.nextUrl.pathname.startsWith("/_next") &&
  //   request.nextUrl.pathname !== "/favicon.ico";
  //
  // if (isInternalRoute && !user) {
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = "/login";
  //   redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
  //   return NextResponse.redirect(redirectUrl);
  // }
  //
  // if (isInternalRoute && user) {
  //   const email = user.email || "";
  //   if (!email.endsWith("@hubkey.co")) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/login";
  //     url.searchParams.set("error", "unauthorized");
  //     return NextResponse.redirect(url);
  //   }
  // }

  return supabaseResponse;
}
