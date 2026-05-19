"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SlotCard, type SlotCardData } from "@/components/slots/SlotCard";
import { Button } from "@/components/ui/Button";
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
  );
}

function FeedEmpty({ ui }: { ui: ReturnType<typeof feedUi> }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="max-w-sm font-display text-lg leading-snug text-[var(--text-bright)]">{ui.emptyTitle}</p>
      <Link href="/slots/new" className="mt-6 w-full max-w-xs">
        <Button type="button" variant="primary" fullWidth>
          {ui.createQuest}
        </Button>
      </Link>
    </div>
  );
}
