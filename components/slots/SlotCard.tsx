"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ActivityIcon } from "./ActivityIcon";
import { Avatar } from "@/components/ui/Avatar";
import { getCategory } from "@/lib/categories";
import { isPlaceCategory, placeCategoryLabel } from "@/lib/places";
import { applyToSlot } from "@/app/actions/applications";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { activityLabel, slotAudienceBadge, slotCardUi } from "@/lib/i18n-ui";

export type SlotCardHost = {
  id: string;
  name: string;
  avatar_url: string | null;
  reliability_score: number | null;
  gender?: "male" | "female";
};

export type SlotCardData = {
  id: string;
  title: string;
  activity_type: string;
  date_time: string;
  location_name: string;
  location_lat?: number;
  location_lng?: number;
  max_spots: number;
  spots_taken: number;
  status: string;
  host: SlotCardHost | null;
  gender_scope?: string | null;
  place_name?: string | null;
  place_category?: string | null;
  place_district?: string | null;
};

type SlotCardProps = {
  slot: SlotCardData;
  index?: number;
  distanceLabel?: string;
  applicationStatus?: "none" | "pending" | "accepted" | "rejected";
  isHost?: boolean;
};

function formatWhen(iso: string, locale: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" }),
    time: d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
  };
}

export function SlotCard({
  slot,
  index = 0,
  distanceLabel,
  applicationStatus = "none",
  isHost,
}: SlotCardProps) {
  const { lang } = useLanguage();
  const t = slotCardUi(lang);
  const locale = lang === "pl" ? "pl-PL" : "en-GB";
  const cat = getCategory(slot.place_category ?? slot.activity_type);
  const guestCap = Math.max(1, slot.max_spots - 1);
  const full = slot.status === "full" || slot.spots_taken >= guestCap;
  const totalPartySize = Math.max(2, slot.max_spots);
  const occupiedSpots = Math.min(totalPartySize, 1 + slot.spots_taken);
  const audience = slotAudienceBadge(lang, slot.gender_scope);
  const when = formatWhen(slot.date_time, locale);

  const headline = slot.place_name ?? slot.title;
  const activityName =
    slot.place_category && isPlaceCategory(slot.place_category)
      ? placeCategoryLabel(lang, slot.place_category)
      : activityLabel(lang, slot.activity_type);

  const cta = isHost ? (
    <Link href={`/slots/${slot.id}`} className="btn-secondary px-4 py-2 text-sm">
      {t.viewDetails}
    </Link>
  ) : full ? (
    <button type="button" disabled className="btn-secondary px-4 py-2 text-sm opacity-50">
      {t.partyFull}
    </button>
  ) : applicationStatus === "accepted" ? (
    <Link href={`/slots/${slot.id}`} className="btn-secondary px-4 py-2 text-sm">
      {t.viewDetails}
    </Link>
  ) : applicationStatus === "pending" ? (
    <button type="button" disabled className="btn-secondary px-4 py-2 text-sm opacity-60">
      {t.waiting}
    </button>
  ) : applicationStatus === "rejected" ? (
    <button type="button" disabled className="btn-secondary px-4 py-2 text-sm opacity-50">
      {t.declined}
    </button>
  ) : (
    <form
      action={async () => {
        await applyToSlot(slot.id);
      }}
    >
      <button type="submit" className="btn-primary px-5 py-2 text-sm">
        {t.joinQuest}
      </button>
    </form>
  );

  return (
    <m.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.25) }}
      whileHover={{ y: -3 }}
      className="floating-card-hover relative overflow-hidden rounded-3xl border border-ash-200/40 bg-surface shadow-sm"
    >
      <div
        className="absolute left-0 top-0 h-full w-1.5 transition-all duration-base group-hover:w-2"
        style={{ background: cat.color }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between bg-ash-50/80 px-5 py-4 pl-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <ActivityIcon activityType={slot.activity_type} size="sm" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">{activityName}</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {when.day} · {when.time}
            </p>
          </div>
        </div>
        {distanceLabel ? (
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
            {distanceLabel}
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-6 pt-4">
        <div>
          <Link href={`/slots/${slot.id}`} className="text-lg font-bold leading-snug text-[var(--text-primary)]">
            {headline}
          </Link>
          {(slot.place_district || (!slot.place_name && slot.location_name)) && (
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              {slot.place_district ?? slot.location_name}
            </p>
          )}
        </div>

        {audience ? <span className="badge badge-purple">{audience}</span> : null}

        {/* Party avatars row */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="relative z-[2] ring-2 ring-white rounded-full">
              <Avatar src={slot.host?.avatar_url} name={slot.host?.name ?? "?"} size={32} />
            </div>
            {Array.from({ length: Math.min(3, totalPartySize - 1) }, (_, i) => (
              <div
                key={i}
                className="relative z-[1] flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-surface-2)] text-[10px] font-semibold text-[var(--text-muted)] ring-2 ring-white"
                style={{ marginLeft: i === 0 ? -8 : -10 }}
              >
                {i < slot.spots_taken ? "✓" : "+"}
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{slot.host?.name}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {occupiedSpots}/{totalPartySize}{" "}
              {lang === "pl" ? "w ekipie" : "in party"}
            </p>
          </div>
          {slot.host?.reliability_score != null ? (
            <span className="badge badge-green shrink-0">
              {Math.round(slot.host.reliability_score * 100)}%
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">{cta}</div>
      </div>
    </m.article>
  );
}
