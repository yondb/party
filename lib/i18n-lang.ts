import type { NextRequest } from "next/server";

export type Lang = "en" | "pl";

export const DEFAULT_LANG: Lang = "en";

/** Single source of truth for navbar / persistence — add rows when new `Lang` values exist. */
export const SUPPORTED_LANGS: readonly { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
] as const;

export const LANG_COOKIE = "partyfinder_lang";
export const LANG_STORAGE_KEY = "partyfinder_lang";
/** Set by middleware for the current request (RSC reads before Set-Cookie is visible). */
export const LANG_HEADER = "x-party-lang";

export function isLang(v: string | null | undefined): v is Lang {
  return v === "en" || v === "pl";
}

export function parseLang(v: string | null | undefined): Lang | null {
  if (v === "en" || v === "pl") return v;
  return null;
}

/** `?lang=pl|en` or `?hl=pl|en` (Google / ads). */
export function langFromSearchParams(params: URLSearchParams): Lang | null {
  for (const key of ["lang", "hl"]) {
    const raw = params.get(key);
    if (!raw) continue;
    const lower = raw.toLowerCase();
    if (lower === "en" || lower.startsWith("en-")) return "en";
    if (lower === "pl" || lower.startsWith("pl-")) return "pl";
  }
  return null;
}

/** Poland → PL; otherwise EN. Uses Vercel / Cloudflare geo when present. */
export function detectLangFromGeoAndLocale(
  countryCode: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Lang {
  const country = (countryCode ?? "").trim().toUpperCase();
  if (country === "PL") return "pl";
  if (country === "US") return "en";

  const al = (acceptLanguage ?? "").toLowerCase();
  if (/(^|,|\s)pl(-|;|,|$)/.test(al)) return "pl";

  return DEFAULT_LANG;
}

export type ResolvedLang = {
  lang: Lang;
  /** Persist choice (first visit, URL override, or missing cookie). */
  setCookie: boolean;
  /** Remove `lang` / `hl` from URL after applying. */
  stripParams: boolean;
};

/**
 * Priority: saved cookie → URL ?lang= / ?hl= → geo PL / Accept-Language pl → EN.
 */
export function resolveRequestLang(request: NextRequest): ResolvedLang {
  const fromUrl = langFromSearchParams(request.nextUrl.searchParams);
  const cookie = parseLang(request.cookies.get(LANG_COOKIE)?.value);

  if (fromUrl) {
    return {
      lang: fromUrl,
      setCookie: true,
      stripParams: true,
    };
  }

  if (cookie) {
    return { lang: cookie, setCookie: false, stripParams: false };
  }

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code");
  const lang = detectLangFromGeoAndLocale(country, request.headers.get("accept-language"));

  return { lang, setCookie: true, stripParams: false };
}
