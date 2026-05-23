"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { navUi } from "@/lib/i18n-ui";
import {
  BottomIconFeed,
  BottomIconMap,
  BottomIconProfile,
  BottomIconQuest,
} from "@/components/layout/BottomNavIcons";

const links = [
  { href: "/feed", key: "feed" as const, Icon: BottomIconFeed },
  { href: "/map", key: "map" as const, Icon: BottomIconMap },
  { href: "/map", key: "quest" as const, Icon: BottomIconQuest },
  { href: "/profile", key: "profile" as const, Icon: BottomIconProfile },
] as const;

function guestHref(key: (typeof links)[number]["key"]): string {
  if (key === "map" || key === "feed" || key === "quest") return "/map";
  return "/auth";
}

export function BottomNav({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const n = navUi(lang);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <nav
        className="glass-strong pointer-events-auto flex items-center gap-0.5 rounded-full px-2 py-1.5"
        style={{ boxShadow: "var(--shadow-float)" }}
        aria-label={lang === "pl" ? "Nawigacja" : "Navigation"}
      >
        {links.map((l) => {
          const href = isGuest ? guestHref(l.key) : l.href;
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (isGuest && l.key === "feed" && pathname === "/map") ||
            (l.key === "quest" && pathname === "/map");
          const label = n[l.key];
          const Icon = l.Icon;
          return (
            <Link
              key={l.key}
              href={href}
              className={`relative flex flex-col items-center justify-center rounded-full px-3.5 py-2 transition-all duration-200 ${
                active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
              style={
                active
                  ? {
                      background: "var(--accent-soft)",
                      boxShadow: "0 0 20px var(--accent-glow)",
                    }
                  : undefined
              }
            >
              <Icon active={active} />
              <span className="mt-0.5 max-w-[4.5rem] truncate text-[10px] font-medium leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
