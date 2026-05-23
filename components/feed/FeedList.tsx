"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LazyMotion, domAnimation } from "framer-motion";
import { SlotCard, type SlotCardData } from "@/components/slots/SlotCard";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { feedUi } from "@/lib/i18n-ui";
import { distanceKm, formatDistanceKm } from "@/lib/geo";

type FeedListProps = {
  cards: SlotCardData[];
  userId: string;
  appStatusBySlot: Record<string, "pending" | "accepted" | "rejected">;
};

export function FeedList({ cards, userId, appStatusBySlot }: FeedListProps) {
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

  if (cards.length === 0) {
    return <FeedEmpty ui={ui} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <ul className="flex flex-col gap-4" suppressHydrationWarning>
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
    </LazyMotion>
  );
}

function FeedEmpty({ ui }: { ui: ReturnType<typeof feedUi> }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <p style={{ fontSize: 40, marginBottom: 16 }}>🗺️</p>
      <p style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>{ui.emptyTitle}</p>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 24 }}>
        {ui.emptySubtitle}
      </p>
      <Link href="/map">
        <button type="button" className="btn-primary">
          {ui.goToMap}
        </button>
      </Link>
    </div>
  );
}
