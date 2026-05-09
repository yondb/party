export type Lang = "en" | "pl";

export const LANG_COOKIE = "partyfinder_lang";
export const LANG_STORAGE_KEY = "partyfinder_lang";

export function parseLang(v: string | null | undefined): Lang {
  return v === "pl" ? "pl" : "en";
}
