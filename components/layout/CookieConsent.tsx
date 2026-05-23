"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cookieBannerUi } from "@/lib/i18n-ui";

const CONSENT_KEY = "pf_cookie_consent_v1";

export function CookieConsent() {
  const { lang } = useLanguage();
  const t = cookieBannerUi(lang);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(CONSENT_KEY);
      if (!v) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_KEY, "1");
      const secure = window.location.protocol === "https:";
      document.cookie = `pf_cookie_consent=1;path=/;max-age=31536000;SameSite=Lax${secure ? ";Secure" : ""}`;
    } catch {
      // noop
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--border-medium)] bg-[var(--bg-page)]/98 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-snug text-[var(--text-secondary)]">{t.text}</p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href="/legal/privacy" className="btn-secondary inline-flex min-h-[2.5rem] items-center px-3 text-sm">
            {t.learnMore}
          </Link>
          <button type="button" onClick={accept} className="btn-primary inline-flex min-h-[2.5rem] items-center px-4 text-sm">
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
