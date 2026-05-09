"use client";

import { useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

/** Syncs <html lang> with the in-app language toggle. */
export function DocumentLang() {
  const { lang } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
