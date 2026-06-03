import { DEFAULT_LANG, type Lang } from "@/lib/i18n-lang";

/** Server Components — English-only launch. */
export async function getServerLang(): Promise<Lang> {
  return DEFAULT_LANG;
}
