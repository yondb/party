"use client";

import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export function LandingTopBar() {
  return (
    <div className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 sm:right-5">
      <LanguageToggle />
    </div>
  );
}
