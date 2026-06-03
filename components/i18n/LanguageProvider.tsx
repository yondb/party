"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n-lang";

export type { Lang };

type LanguageContextValue = {
  lang: Lang;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ lang: DEFAULT_LANG }), []);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
