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
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t pb-safe backdrop-blur-sm"
      style={{
        background: "var(--bg-surface)",
        borderTopColor: "var(--border)",
      }}
    >
      <div className={`${shellMaxClass} flex items-stretch justify-around px-2 pt-2 sm:px-3`}>
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
              className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 transition sm:min-h-[3.5rem]"
              style={
                active
                  ? {
                      color: "var(--accent)",
                      background: "var(--accent-soft)",
                      borderRadius: "var(--radius-md)",
                      padding: "6px 16px",
                      fontSize: 11,
                      fontWeight: 500,
                    }
                  : {
                      color: "var(--text-muted)",
                      fontSize: 11,
                      fontWeight: 500,
                    }
              }
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
