import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  attachLangToRedirect,
  finalizeWithLang,
  redirectIfLangParams,
} from "@/lib/i18n-middleware";

const PUBLIC_PREFIXES = [
  "/",
  "/landing",
  "/map",
  "/places",
  "/onboarding",
  "/auth",
  "/dev",
  "/legal",
  "/manifest.webmanifest",
  "/manifest.json",
  "/sw.js",
];
const PROTECTED_PREFIXES = [
  "/feed",
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
  const path = request.nextUrl.pathname;
  if (path.startsWith("/_next") || path.startsWith("/api")) {
    return NextResponse.next({ request });
  }

  const langRedirect = redirectIfLangParams(request);
  if (langRedirect) return langRedirect;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return finalizeWithLang(request, NextResponse.next({ request }));
  }

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

  const isPublic = startsWithAny(path, PUBLIC_PREFIXES);
  const needsAuth = startsWithAny(path, PROTECTED_PREFIXES);

  if (!user && needsAuth) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    return attachLangToRedirect(request, NextResponse.redirect(redirectUrl));
  }

  if (!user && !isPublic && !needsAuth) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/landing";
    return attachLangToRedirect(request, NextResponse.redirect(redirectUrl));
  }

  if (user) {
    const setupDone = user.user_metadata?.setup_done === true;
    if (!setupDone && path !== "/setup" && path !== "/auth" && !path.startsWith("/dev")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/setup";
      return attachLangToRedirect(request, NextResponse.redirect(redirectUrl));
    }
    if (setupDone && (path === "/auth" || path === "/landing")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/map";
      return attachLangToRedirect(request, NextResponse.redirect(redirectUrl));
    }

    if (setupDone) {
      const { data: prof } = await supabase
        .from("users")
        .select("banned")
        .eq("id", user.id)
        .maybeSingle();
      if (prof?.banned === true) {
        const allowedWhileBanned =
          path === "/banned" || path.startsWith("/auth") || path.startsWith("/api");
        if (!allowedWhileBanned) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/banned";
          return attachLangToRedirect(request, NextResponse.redirect(redirectUrl));
        }
      }
    }
  }

  return finalizeWithLang(request, response);
}
