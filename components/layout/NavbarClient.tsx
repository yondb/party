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
        className="flex w-full flex-wrap items-center justify-end gap-x-2 gap-y-1.5 sm:w-auto sm:flex-nowrap sm:gap-x-3"
        aria-label={lang === "pl" ? "Główne odnośniki" : "Main links"}
      >
        <Link
          href="/auth"
          className="inline-flex min-h-[2.5rem] items-center justify-center px-2 font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)] hover:text-[var(--gold-bright)] sm:text-xs"
        >
          {t.signIn}
        </Link>
        <Link
          href="/auth"
          className="btn-primary inline-flex min-h-[2.5rem] items-center justify-center rounded-md px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] sm:text-xs"
        >
          {t.signUp}
        </Link>
        <div className="ml-1 shrink-0 border-l border-[var(--gold-dim)] pl-2 sm:ml-2 sm:pl-3">
          <LanguageToggle />
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="flex w-full flex-wrap items-center justify-end gap-x-2 gap-y-1.5 sm:w-auto sm:flex-nowrap sm:gap-x-3"
      aria-label={lang === "pl" ? "Główne odnośniki" : "Main links"}
    >
      <Link
        href="/notifications"
        className="relative inline-flex min-h-[2.5rem] max-w-[4.25rem] items-center justify-center px-0.5 text-center font-display text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-[var(--text-secondary)] hover:text-[var(--gold-bright)] sm:max-w-none sm:px-2 sm:text-xs sm:tracking-[0.12em]"
      >
        <span className="sm:hidden">{t.alertsShort}</span>
        <span className="hidden sm:inline">{t.alerts}</span>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--gold-mid)] px-1 text-[11px] font-bold text-[var(--bg-void)]">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
      <Link
        href="/profile"
        className="inline-flex min-h-[2.5rem] items-center justify-center px-0.5 font-display text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-[var(--text-secondary)] hover:text-[var(--gold-bright)] sm:px-2 sm:text-xs sm:tracking-[0.12em]"
      >
        {t.profile}
      </Link>
      {showAdmin ? (
        <Link
          href="/admin"
          className="inline-flex min-h-[2.5rem] items-center justify-center px-0.5 font-display text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-[var(--status-pending)] hover:text-[var(--gold-bright)] sm:px-2 sm:text-xs sm:tracking-[0.12em]"
        >
          {t.admin}
        </Link>
      ) : null}
      <div className="ml-1 shrink-0 border-l border-[var(--gold-dim)] pl-2 sm:ml-2 sm:pl-3">
        <LanguageToggle />
      </div>
    </nav>
  );
}
