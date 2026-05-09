"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { navUi } from "@/lib/i18n-ui";

const links = [
  { href: "/feed", key: "feed" as const, icon: "F" },
  { href: "/map", key: "map" as const, icon: "M" },
  { href: "/slots/new", key: "quest" as const, icon: "+" },
  { href: "/profile", key: "profile" as const, icon: "P" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const n = navUi(lang);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--gold-dim)] bg-[var(--bg-void)]/95 pb-safe backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const label = n[l.key];
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-2 text-[10px] font-display uppercase tracking-widest transition ${
                active
                  ? "text-[var(--gold-bright)] drop-shadow-[0_0_8px_rgba(240,192,64,0.35)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <span className="text-lg">{l.icon}</span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
