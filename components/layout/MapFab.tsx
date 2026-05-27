"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function MapFab() {
  const { lang } = useLanguage();
  return (
    <Link
      href="/slots/new"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-honey-500 text-graphite shadow-honey transition-all duration-fast ease-out-soft hover:scale-105 hover:bg-honey-600 active:scale-95 lg:bottom-8 lg:right-8 lg:h-16 lg:w-16"
      aria-label={lang === "pl" ? "Nowy slot" : "New slot"}
    >
      <Plus className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}
