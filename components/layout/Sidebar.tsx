"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Sparkles, User } from "lucide-react";
import { navUi } from "@/lib/i18n-ui";
import { cn } from "@/lib/utils";

const links = [
  { href: "/map", key: "map" as const, Icon: Map },
  { href: "/feed", key: "feed" as const, Icon: Sparkles },
  { href: "/profile", key: "profile" as const, Icon: User },
] as const;

export function Sidebar({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname();
  const n = navUi();

  return (<aside className="hidden lg:flex sticky top-16 h-[calc(100vh-4rem)] w-20 shrink-0 flex-col items-center py-6 gap-2 border-r border-ash-200/40 bg-bg">
      <nav className="flex flex-col items-center gap-2" aria-label="Navigation">
        {links.map((l) => {
          const href =
            isGuest && l.key === "profile" ? "/auth" : isGuest && l.key !== "map" ? "/map" : l.href;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = l.Icon;
          return (<Link
              key={l.key}
              href={href}
              className={cn("flex flex-col items-center gap-1 rounded-2xl px-3 py-2.5 transition-all duration-fast",
                active ? "bg-graphite text-surface" : "text-ash-500 hover:bg-ash-100 hover:text-ash-900",
              )}
              aria-current={active ? "page" : undefined}
              title={n[l.key]}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{n[l.key]}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
