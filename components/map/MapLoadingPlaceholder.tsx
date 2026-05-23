"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { mapUi } from "@/lib/i18n-ui";

export function MapLoadingPlaceholder() {
  const { lang } = useLanguage();
  const m = mapUi(lang);
  return (
    <div
      className="map-root animate-pulse"
      style={{
        height: "calc(100dvh - var(--nav-height) - var(--dock-height) - 2rem)",
        minHeight: "420px",
      }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
        <div className="h-12 w-12 rounded-2xl bg-[var(--bg-surface-2)]" />
        <p className="text-sm font-medium">{m.loading}</p>
      </div>
    </div>
  );
}
