/** English-only launch (Austin US). */
export type Lang = "en";

export const DEFAULT_LANG: Lang = "en";

export const LANG_COOKIE = "partyfinder_lang";
export const LANG_HEADER = "x-party-lang";

export function isLang(v: string | null | undefined): v is Lang {
  return v === "en";
}

export function parseLang(_v: string | null | undefined): Lang {
  return DEFAULT_LANG;
}

export function langFromSearchParams(_params: URLSearchParams): Lang | null {
  return null;
}

export function detectLangFromGeoAndLocale(
  _countryCode?: string | null,
  _acceptLanguage?: string | null,
): Lang {
  return DEFAULT_LANG;
}

export type ResolvedLang = {
  lang: Lang;
  setCookie: boolean;
  stripParams: boolean;
};

export function resolveRequestLang(_request?: unknown): ResolvedLang {
  return { lang: DEFAULT_LANG, setCookie: true, stripParams: false };
}
