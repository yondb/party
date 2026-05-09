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
    <div className="flex items-center gap-4">
      <LanguageToggle />
      <Link
        href="/notifications"
        className="relative font-display text-xs uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--gold-bright)]"
      >
        {t.alerts}
        {unread > 0 ? (
          <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--gold-mid)] px-1 text-[10px] font-bold text-[var(--bg-void)]">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
      <Link
        href="/profile"
        className="font-display text-xs uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--gold-bright)]"
      >
        {t.profile}
      </Link>
      {showAdmin ? (
        <Link
          href="/admin"
          className="font-display text-xs uppercase tracking-widest text-[var(--status-pending)] hover:text-[var(--gold-bright)]"
        >
          {t.admin}
        </Link>
      ) : null}
    </div>
  );
}
