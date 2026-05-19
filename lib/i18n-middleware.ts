import { type NextRequest, NextResponse } from "next/server";
import { LANG_COOKIE, LANG_HEADER, resolveRequestLang } from "@/lib/i18n-lang";

const LANG_COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

/** Redirect when `?lang=` / `?hl=` was used — saves choice and cleans the URL. */
export function redirectIfLangParams(request: NextRequest): NextResponse | null {
  const resolved = resolveRequestLang(request);
  if (!resolved.stripParams) return null;

  const url = request.nextUrl.clone();
  url.searchParams.delete("lang");
  url.searchParams.delete("hl");
  const redirect = NextResponse.redirect(url);
  redirect.cookies.set(LANG_COOKIE, resolved.lang, LANG_COOKIE_OPTS);
  redirect.headers.set(LANG_HEADER, resolved.lang);
  return redirect;
}

export function attachLangToRedirect(request: NextRequest, redirect: NextResponse): NextResponse {
  const { lang, setCookie } = resolveRequestLang(request);
  redirect.headers.set(LANG_HEADER, lang);
  if (setCookie) redirect.cookies.set(LANG_COOKIE, lang, LANG_COOKIE_OPTS);
  return redirect;
}

/** Final pass: header for RSC + cookie on first visit / geo detect. */
export function finalizeWithLang(request: NextRequest, response: NextResponse): NextResponse {
  const { lang, setCookie } = resolveRequestLang(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LANG_HEADER, lang);

  const out = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.cookies.getAll().forEach((c) => {
    out.cookies.set(c.name, c.value);
  });
  if (setCookie) {
    out.cookies.set(LANG_COOKIE, lang, LANG_COOKIE_OPTS);
  }
  out.headers.set(LANG_HEADER, lang);
  return out;
}
