import { cookies, headers } from "next/headers";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  LANG_HEADER,
  parseLang,
  type Lang,
} from "@/lib/i18n-lang";

/** Server Components: cookie, or lang resolved in middleware for this request. */
export function getServerLang(): Lang {
  const h = headers();
  const fromMiddleware = parseLang(h.get(LANG_HEADER));
  if (fromMiddleware) return fromMiddleware;

  return parseLang(cookies().get(LANG_COOKIE)?.value) ?? DEFAULT_LANG;
}
