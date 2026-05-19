"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  LANG_STORAGE_KEY,
  parseLang,
  type Lang,
} from "@/lib/i18n-lang";

export type { Lang };

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function syncLangCookie(next: Lang) {
  try {
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:";
    const tail = secure ? ";Secure" : "";
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax${tail}`;
  } catch {
    // noop
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const fromCookie = document.cookie
        .split(";")
        .map((s) => s.trim())
        .find((s) => s.startsWith(`${LANG_COOKIE}=`))
        ?.split("=")[1];
      const fromStorage = window.localStorage.getItem(LANG_STORAGE_KEY);
      const next = parseLang(fromCookie) ?? parseLang(fromStorage) ?? DEFAULT_LANG;
      setLangState(next);
      syncLangCookie(next);
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // noop
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // noop
    }
    syncLangCookie(next);
  };

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}

