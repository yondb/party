"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const COPY = {
  en: { alerts: "Alerts", profile: "Profile", admin: "Admin" },
  pl: { alerts: "Powiadomienia", profile: "Profil", admin: "Admin" },
} as const;

export function NavbarClient({
  unread,
  showAdmin,
}: {
  unread: number;
  showAdmin: boolean;
}) {
  const { lang } = useLanguage();
  const t = COPY[lang];

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <LanguageToggle />
      <Link
        href="/notifications"
        className="relative inline-flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center px-1 text-center font-display text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-[var(--text-secondary)] hover:text-[var(--gold-bright)] sm:min-w-0 sm:px-2 sm:text-xs"
      >
        {t.alerts}
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--gold-mid)] px-1 text-[11px] font-bold text-[var(--bg-void)]">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
      <Link
        href="/profile"
        className="inline-flex min-h-[2.5rem] items-center justify-center px-1 font-display text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-[var(--text-secondary)] hover:text-[var(--gold-bright)] sm:px-2 sm:text-xs"
      >
        {t.profile}
      </Link>
      {showAdmin ? (
        <Link
          href="/admin"
          className="inline-flex min-h-[2.5rem] items-center justify-center px-1 font-display text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-[var(--status-pending)] hover:text-[var(--gold-bright)] sm:px-2 sm:text-xs"
        >
          {t.admin}
        </Link>
      ) : null}
    </div>
  );
}
