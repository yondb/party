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
    <div className="relative shrink-0">
      <select
        value={lang}
        onChange={(e) => {
          const v = e.target.value;
          if (isLang(v)) pick(v);
        }}
        aria-label="Language / Język"
        className="min-h-[44px] min-w-[44px] cursor-pointer appearance-none rounded-full border border-[var(--border-medium)] bg-[var(--bg-surface-2)] px-2 py-2 text-center text-xs font-semibold text-[var(--text-primary)] outline-none transition hover:border-[var(--border-strong)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] sm:text-sm"
      >
        {SUPPORTED_LANGS.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] leading-none text-[var(--text-muted)]"
        aria-hidden
      >
        ▼
      </span>
    </div>
  );
}
