"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  function pick(next: "en" | "pl") {
    setLang(next);
    router.refresh();
  }

  return (
    <div className="inline-flex items-center rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] p-0.5 text-[10px] font-display uppercase tracking-widest">
      <button
        type="button"
        onClick={() => pick("en")}
        className={`rounded px-2 py-1 transition ${
          lang === "en"
            ? "bg-[var(--gold-mid)] text-[var(--bg-void)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => pick("pl")}
        className={`rounded px-2 py-1 transition ${
          lang === "pl"
            ? "bg-[var(--gold-mid)] text-[var(--bg-void)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        PL
      </button>
    </div>
  );
}

