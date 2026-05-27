"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Sparkles, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { navUi } from "@/lib/i18n-ui";
import { cn } from "@/lib/utils";

const links = [
  { href: "/map", key: "map" as const, Icon: Map },
  { href: "/feed", key: "feed" as const, Icon: Sparkles },
  { href: "/profile", key: "profile" as const, Icon: User },
] as const;

export function Sidebar({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const n = navUi(lang);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-20 flex-col items-center border-r border-ash-200/70 bg-surface pt-safe lg:flex">
      <div className="flex h-16 w-full items-center justify-center">
        <Logo size="sm" href="/map" />
      </div>
      <nav className="mt-4 flex flex-1 flex-col items-center gap-2" aria-label={lang === "pl" ? "Nawigacja" : "Navigation"}>
        {links.map((l) => {
          const href =
            isGuest && l.key === "profile" ? "/auth" : isGuest && l.key !== "map" ? "/map" : l.href;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = l.Icon;
          return (
            <Link
              key={l.key}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-3 py-2.5 transition-all duration-fast",
                active ? "bg-ash-100 text-ash-900" : "text-ash-400 hover:bg-ash-50 hover:text-ash-700",
              )}
              aria-current={active ? "page" : undefined}
              title={n[l.key]}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              <span className="text-[10px] font-medium">{n[l.key]}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
