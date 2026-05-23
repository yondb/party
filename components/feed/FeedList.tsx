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
      {/* Hero */}
      <m.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-[var(--radius-2xl)] p-6"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,122,0,0.12) 0%, rgba(255,255,255,0.95) 45%, rgba(246,247,251,1) 100%)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="relative z-[1]">
          <p className="text-sm font-medium text-[var(--accent)]">
            {lang === "pl" ? "Gotowy na ruch?" : "Ready to move?"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)]">{ui.title}</h1>
          <p className="mt-2 max-w-[28ch] text-base leading-relaxed text-[var(--text-secondary)]">
            {ui.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/map" className="btn-primary">
              {ui.heroCta}
            </Link>
            <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] shadow-sm">
              {totalCount} {lang === "pl" ? "aktywnych questów" : "active quests"}
            </span>
          </div>
        </div>
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)" }}
          aria-hidden
        />
      </m.section>

      {cards.length === 0 ? (
        <FeedEmpty ui={ui} />
      ) : (
        <>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{ui.nearbySection}</h2>
            <span className="text-sm text-[var(--text-muted)]">
              {cards.length} {lang === "pl" ? "wyników" : "results"}
            </span>
          </div>
          <ul className="flex flex-col gap-5" suppressHydrationWarning>
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
      className="floating-card flex flex-col items-center px-6 py-14 text-center"
    >
      <m.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
        style={{ background: "var(--accent-soft)" }}
      >
        🧭
      </m.div>
      <p className="text-xl font-bold text-[var(--text-primary)]">{ui.emptyTitle}</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">{ui.emptySubtitle}</p>
      <Link href="/map" className="btn-primary mt-8">
        {ui.goToMap}
      </Link>
    </m.div>
  );
}
