"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { mapUi } from "@/lib/i18n-ui";

export function MapLoadingPlaceholder() {
  const { lang } = useLanguage();
  const m = mapUi(lang);
  return (
    <div className="map-root animate-pulse">
      <div className="flex h-full flex-col items-center justify-center gap-3 text-ash-500">
        <div className="h-12 w-12 rounded-2xl bg-ash-100" />
        <p className="text-sm font-medium">{m.loading}</p>
      </div>
    </div>
  );
}
