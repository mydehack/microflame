import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublicEnv } from "@/lib/env";

const privatePaths = [
  "/home",
  "/discover",
  "/goals",
  "/mentors",
  "/onboarding",
  "/profile",
  "/settings",
  "/messages",
  "/communities",
  "/connections",
  "/notifications",
  "/projects",
  "/admin",
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivate = privatePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/recover";
  const env = getSupabasePublicEnv();
  const demoCookie = request.cookies.get("coned_session");
  const isLoggedOutExplicitly = request.cookies.get("coned_logged_out")?.value === "true";

  // Check if session exists (either Supabase or Demo Cookie or local default)
  let hasSession = Boolean(demoCookie?.value) || !isLoggedOutExplicitly;

  if (env) {
    try {
      let response = NextResponse.next({ request });
      const supabase = createServerClient<Database>(env.url, env.key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getClaims();
      if (data?.claims?.sub) {
        hasSession = true;
      }
    } catch {
      // Ignore Supabase check errors
    }
  }

  // Root path: If logged in, go to /home, else show welcome screen
  if (pathname === "/") {
    if (hasSession && !isLoggedOutExplicitly) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Private path access control
  if (isPrivate && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Auth pages: If already logged in, redirect to home
  if (isAuthPage && hasSession && !isLoggedOutExplicitly) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
