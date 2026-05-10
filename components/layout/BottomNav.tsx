"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { navUi } from "@/lib/i18n-ui";
import { shellMaxClass } from "@/lib/layout-shell";
import {
  BottomIconFeed,
  BottomIconMap,
  BottomIconProfile,
  BottomIconQuest,
} from "@/components/layout/BottomNavIcons";

const links = [
  { href: "/feed", key: "feed" as const, Icon: BottomIconFeed },
  { href: "/map", key: "map" as const, Icon: BottomIconMap },
  { href: "/slots/new", key: "quest" as const, Icon: BottomIconQuest },
  { href: "/profile", key: "profile" as const, Icon: BottomIconProfile },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const n = navUi(lang);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--gold-dim)] bg-[var(--bg-void)]/95 pb-safe backdrop-blur-sm">
      <div className={`${shellMaxClass} flex items-stretch justify-around px-1 pt-2 sm:px-3`}>
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const label = n[l.key];
          const Icon = l.Icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md py-2 text-[11px] font-display font-semibold uppercase leading-tight tracking-[0.12em] transition sm:min-h-[3.5rem] sm:text-xs sm:tracking-[0.14em] ${
                active
                  ? "text-[var(--gold-bright)] drop-shadow-[0_0_8px_rgba(240,192,64,0.35)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon active={active} />
              <span className="max-w-[5.5rem] truncate sm:max-w-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
