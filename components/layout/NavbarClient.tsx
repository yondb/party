"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const COPY = {
  en: {
    alerts: "Alerts",
    alertsShort: "Alerts",
    profile: "Profile",
    admin: "Admin",
    signIn: "Sign in",
    signUp: "Join",
  },
  pl: {
    alerts: "Powiadomienia",
    alertsShort: "Pow.",
    profile: "Profil",
    admin: "Admin",
    signIn: "Zaloguj",
    signUp: "Dołącz",
  },
} as const;

const navLinkClass = "btn-ghost text-sm";

export function NavbarClient({
  unread,
  showAdmin,
  isGuest = false,
}: {
  unread: number;
  showAdmin: boolean;
  isGuest?: boolean;
}) {
  const { lang } = useLanguage();
  const t = COPY[lang];

  if (isGuest) {
    return (
      <nav
        className="flex items-center gap-2"
        aria-label={lang === "pl" ? "Główne odnośniki" : "Main links"}
      >
        <Link href="/auth" className={navLinkClass}>
          {t.signIn}
        </Link>
        <Link href="/auth" className="btn-primary min-h-[44px] px-4 py-2 text-sm">
          {t.signUp}
        </Link>
        <LanguageToggle />
      </nav>
    );
  }

  return (
    <nav
      className="flex items-center gap-1 sm:gap-2"
      aria-label={lang === "pl" ? "Główne odnośniki" : "Main links"}
    >
      <Link href="/notifications" className={`relative ${navLinkClass}`}>
        <span className="hidden sm:inline">{t.alerts}</span>
        <span className="sm:hidden">{t.alertsShort}</span>
        {unread > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
      <Link href="/profile" className={navLinkClass}>
        {t.profile}
      </Link>
      {showAdmin ? (
        <Link href="/admin" className={navLinkClass}>
          {t.admin}
        </Link>
      ) : null}
      <LanguageToggle />
    </nav>
  );
}
