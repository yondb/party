"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { SlotCard, slotDataFromLegacy } from "@/components/slot/SlotCard";
import type { SlotCardData } from "@/components/slots/SlotCard";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { feedUi } from "@/lib/i18n-ui";
import { distanceKm, formatDistanceKm } from "@/lib/geo";

type FeedListProps = {
  cards: SlotCardData[];
  userId: string;
  appStatusBySlot: Record<string, "pending" | "accepted" | "rejected">;
  totalCount: number;
};

export function FeedList({ cards }: FeedListProps) {
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
      {cards.length === 0 ? (
        <FeedEmpty ui={ui} />
      ) : (
        <>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-display-md text-ash-900">{ui.nearbySection}</h2>
            <Link href="/map" className="text-body-sm font-medium text-ash-700 hover:text-honey-700">
              {ui.goToMap} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" suppressHydrationWarning>
            {cardsWithDistance.map(({ slot, distanceLabel }) => {
              const data = slotDataFromLegacy({
                ...slot,
                host: slot.host
                  ? {
                      name: slot.host.name,
                      avatar_url: slot.host.avatar_url,
                      reliability_score: slot.host.reliability_score,
                    }
                  : null,
              });
              if (distanceLabel) {
                const km = parseFloat(distanceLabel);
                if (!Number.isNaN(km)) data.distanceMeters = km * 1000;
              }
              return <SlotCard key={slot.id} slot={data} />;
            })}
          </div>
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
      className="flex flex-col items-center rounded-3xl bg-surface border border-ash-200/40 px-8 py-16 text-center shadow-sm"
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
