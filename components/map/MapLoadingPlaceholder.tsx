"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { mapUi } from "@/lib/i18n-ui";

export function MapLoadingPlaceholder() {
  const { lang } = useLanguage();
  const m = mapUi(lang);
  return (
    <div className="flex h-[70dvh] items-center justify-center text-[var(--text-muted)]">
      {m.loading}
    </div>
  );
}
