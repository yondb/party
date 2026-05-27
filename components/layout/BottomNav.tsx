"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Sparkles, User } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { navUi } from "@/lib/i18n-ui";
import { cn } from "@/lib/utils";

const links = [
  { href: "/map", key: "map" as const, Icon: Map },
  { href: "/feed", key: "feed" as const, Icon: Sparkles },
  { href: "/profile", key: "profile" as const, Icon: User },
] as const;

function guestHref(key: (typeof links)[number]["key"]): string {
  if (key === "profile") return "/auth";
  return "/map";
}

export function BottomNav({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const n = navUi(lang);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t border-ash-200/70 bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={lang === "pl" ? "Nawigacja" : "Navigation"}
    >
      {links.map((l) => {
        const href = isGuest ? guestHref(l.key) : l.href;
        const active =
          pathname === href ||
          pathname.startsWith(`${href}/`) ||
          (isGuest && l.key === "feed" && pathname === "/map");
        const label = n[l.key];
        const Icon = l.Icon;
        return (
          <Link
            key={l.key}
            href={href}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-fast"
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={cn("h-6 w-6", active ? "text-ash-900" : "text-ash-400")}
              strokeWidth={active ? 2.25 : 1.75}
              aria-hidden
            />
            <span
              className={cn(
                "text-[11px] font-medium leading-none",
                active ? "text-ash-900" : "text-ash-400",
              )}
            >
              {label}
            </span>
            {active ? (
              <span
                className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-honey-500"
                aria-hidden
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
