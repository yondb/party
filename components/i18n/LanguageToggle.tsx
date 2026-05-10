"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { parseLang, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-lang";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  function pick(next: Lang) {
    setLang(next);
    router.refresh();
  }

  return (
    <div className="relative shrink-0 pl-0.5">
      <select
        value={lang}
        onChange={(e) => pick(parseLang(e.target.value))}
        aria-label="Language / Język"
        className="h-8 w-[3.35rem] cursor-pointer appearance-none rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] py-0 pl-2 pr-6 text-center font-display text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--gold-bright)] outline-none transition hover:border-[var(--gold-dark)] focus-visible:border-[var(--gold-mid)] focus-visible:ring-1 focus-visible:ring-[var(--gold-mid)] sm:h-9 sm:w-[3.65rem] sm:pl-2.5 sm:pr-7 sm:text-[11px]"
        style={{ colorScheme: "dark" }}
      >
        {SUPPORTED_LANGS.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[7px] leading-none text-[var(--gold-mid)] sm:right-1.5 sm:text-[8px]"
        aria-hidden
      >
        ▼
      </span>
    </div>
  );
}
