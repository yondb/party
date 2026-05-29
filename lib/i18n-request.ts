import { cookies, headers } from "next/headers";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  LANG_HEADER,
  parseLang,
  type Lang,
} from "@/lib/i18n-lang";

/** Server Components: cookie, or lang resolved in middleware for this request. */
export async function getServerLang(): Promise<Lang> {
  const h = await headers();
  const fromMiddleware = parseLang(h.get(LANG_HEADER));
  if (fromMiddleware) return fromMiddleware;

  const cookieStore = await cookies();
  return parseLang(cookieStore.get(LANG_COOKIE)?.value) ?? DEFAULT_LANG;
}
