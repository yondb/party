import { cookies } from "next/headers";
import { LANG_COOKIE, parseLang, type Lang } from "@/lib/i18n-lang";

/** Server Components: reads cookie set by the language toggle. */
export function getServerLang(): Lang {
  return parseLang(cookies().get(LANG_COOKIE)?.value);
}
