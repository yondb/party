"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { isLang, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-lang";

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
        onChange={(e) => {
          const v = e.target.value;
          if (isLang(v)) pick(v);
        }}
        aria-label="Language / Język"
        className="min-h-[44px] min-w-[44px] cursor-pointer appearance-none rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] px-2 py-2 text-center font-display text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold-bright)] outline-none transition hover:border-[var(--gold-dark)] focus-visible:border-[var(--gold-mid)] focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] sm:text-sm"
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
