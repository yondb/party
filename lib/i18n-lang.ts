export type Lang = "en" | "pl";

/** Single source of truth for navbar / persistence — add rows when new `Lang` values exist. */
export const SUPPORTED_LANGS: readonly { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
] as const;

export const LANG_COOKIE = "partyfinder_lang";
export const LANG_STORAGE_KEY = "partyfinder_lang";

export function parseLang(v: string | null | undefined): Lang {
  if (v === "pl") return "pl";
  return "en";
}
