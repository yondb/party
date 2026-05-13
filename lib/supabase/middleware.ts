import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/",
  "/landing",
  "/onboarding",
  "/auth",
  "/legal",
  "/manifest.webmanifest",
  "/manifest.json",
  "/sw.js",
];
const PROTECTED_PREFIXES = [
  "/feed",
  "/map",
  "/slots",
  "/profile",
  "/notifications",
  "/settings",
  "/premium",
  "/admin",
];

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (path.startsWith("/_next") || path.startsWith("/api")) return response;

  const isPublic = startsWithAny(path, PUBLIC_PREFIXES);
  const needsAuth = startsWithAny(path, PROTECTED_PREFIXES);

  if (!user && needsAuth) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && !isPublic && !needsAuth) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/landing";
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const setupDone = user.user_metadata?.setup_done === true;
    if (!setupDone && path !== "/setup" && path !== "/auth") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/setup";
      return NextResponse.redirect(redirectUrl);
    }
    if (setupDone && (path === "/auth" || path === "/landing")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/feed";
      return NextResponse.redirect(redirectUrl);
    }

    if (setupDone) {
      const { data: prof } = await supabase.from("users").select("banned").eq("id", user.id).maybeSingle();
      if (prof?.banned === true) {
        const allowedWhileBanned =
          path === "/banned" || path.startsWith("/auth") || path.startsWith("/api");
        if (!allowedWhileBanned) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/banned";
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  return response;
}
