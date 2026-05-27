"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { SlotCard, type SlotCardData } from "@/components/slots/SlotCard";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { feedUi } from "@/lib/i18n-ui";
import { distanceKm, formatDistanceKm } from "@/lib/geo";

type FeedListProps = {
  cards: SlotCardData[];
  userId: string;
  appStatusBySlot: Record<string, "pending" | "accepted" | "rejected">;
  totalCount: number;
};

export function FeedList({ cards, userId, appStatusBySlot, totalCount }: FeedListProps) {
  const { lang } = useLanguage();
  const ui = feedUi(lang);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPosition(null),
      { enableHighAccuracy: false, maximumAge: 120000, timeout: 8000 },
    );
  }, []);

  const cardsWithDistance = useMemo(() => {
    return cards.map((slot) => {
      let distanceLabel: string | undefined;
      if (
        position &&
        slot.location_lat != null &&
        slot.location_lng != null &&
        Number.isFinite(slot.location_lat) &&
        Number.isFinite(slot.location_lng)
      ) {
        const km = distanceKm(position.lat, position.lng, slot.location_lat, slot.location_lng);
        distanceLabel = formatDistanceKm(km, lang);
      }
      return { slot, distanceLabel };
    });
  }, [cards, position, lang]);

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center rounded-3xl border border-ash-200/40 bg-surface p-8 text-center shadow-float"
      >
        <p className="text-sm font-semibold text-orange-500">
          {lang === "pl" ? "Gotowy na ruch?" : "Ready to move?"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ash-900">{ui.title}</h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-slate-500">{ui.subtitle}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/map" className="btn-primary">
            {ui.heroCta}
          </Link>
          <span className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
            {totalCount} {lang === "pl" ? "aktywnych questów" : "active quests"}
          </span>
        </div>
      </m.section>

      {cards.length === 0 ? (
        <FeedEmpty ui={ui} />
      ) : (
        <>
          <div className="mb-5 flex items-end justify-between px-1">
            <h2 className="text-lg font-bold text-slate-800">{ui.nearbySection}</h2>
            <span className="text-sm text-slate-500">
              {cards.length} {lang === "pl" ? "wyników" : "results"}
            </span>
          </div>
          <ul className="flex flex-col gap-6" suppressHydrationWarning>
            {cardsWithDistance.map(({ slot, distanceLabel }, i) => (
              <li key={slot.id}>
                <SlotCard
                  slot={slot}
                  index={i}
                  distanceLabel={distanceLabel}
                  applicationStatus={appStatusBySlot[slot.id] ?? "none"}
                  isHost={userId === slot.host?.id}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </LazyMotion>
  );
}

function FeedEmpty({ ui }: { ui: ReturnType<typeof feedUi> }) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center rounded-3xl bg-white px-8 py-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <m.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-4xl"
      >
        🧭
      </m.div>
      <p className="text-xl font-bold text-slate-800">{ui.emptyTitle}</p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">{ui.emptySubtitle}</p>
      <Link href="/map" className="btn-primary mt-8">
        {ui.goToMap}
      </Link>
    </m.div>
  );
}
