"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { ActivityIcon } from "./ActivityIcon";
import { Avatar } from "@/components/ui/Avatar";
import { getActivity } from "@/lib/activities";
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
  const datePart = d.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const timePart = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

const joinBtnStyle: CSSProperties = {
  padding: "6px 14px",
  borderRadius: "var(--radius-full)",
  background: "var(--accent)",
  border: "none",
  color: "white",
  fontSize: "0.82rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

const secondaryBtnStyle: CSSProperties = {
  ...joinBtnStyle,
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1.5px solid var(--border-medium)",
};

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
  const act = getActivity(slot.activity_type);
  const guestCap = Math.max(1, slot.max_spots - 1);
  const full = slot.status === "full" || slot.spots_taken >= guestCap;
  const totalPartySize = Math.max(2, slot.max_spots);
  const occupiedSpots = Math.min(totalPartySize, 1 + slot.spots_taken);
  const audience = slotAudienceBadge(lang, slot.gender_scope);

  const headline = slot.place_name ?? slot.title;
  const metaParts: string[] = [];
  if (slot.place_category && isPlaceCategory(slot.place_category)) {
    metaParts.push(placeCategoryLabel(lang, slot.place_category));
  } else {
    metaParts.push(activityLabel(lang, slot.activity_type));
  }
  if (slot.place_district) metaParts.push(slot.place_district);
  else if (!slot.place_name) metaParts.push(slot.location_name);
  const metaLine = metaParts.join(" · ");

  const ctaButtons = isHost ? (
    <Link href={`/slots/${slot.id}`} style={secondaryBtnStyle}>
      {t.viewDetails}
    </Link>
  ) : full ? (
    <button type="button" disabled style={{ ...secondaryBtnStyle, opacity: 0.45, cursor: "not-allowed" }}>
      {t.partyFull}
    </button>
  ) : applicationStatus === "accepted" ? (
    <Link href={`/slots/${slot.id}`} style={{ ...secondaryBtnStyle, borderColor: "var(--status-open)", color: "var(--status-open)" }}>
      {t.viewDetails}
    </Link>
  ) : applicationStatus === "pending" ? (
    <button type="button" disabled style={{ ...secondaryBtnStyle, opacity: 0.45, cursor: "not-allowed", borderColor: "var(--status-pending)", color: "var(--status-pending)" }}>
      {t.waiting}
    </button>
  ) : applicationStatus === "rejected" ? (
    <button type="button" disabled style={{ ...secondaryBtnStyle, opacity: 0.45, cursor: "not-allowed", borderColor: "var(--status-full)", color: "var(--status-full)" }}>
      {t.declined}
    </button>
  ) : (
    <form
      action={async () => {
        await applyToSlot(slot.id);
      }}
    >
      <button type="submit" style={joinBtnStyle}>
        {t.joinQuest}
      </button>
    </form>
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: Math.min(index * 0.04, 0.3) }}
    >
      <div
        className="card card-hover relative overflow-hidden"
        style={{ borderTop: `3px solid ${act.color}` }}
      >
        <div style={{ padding: "1rem 1.125rem" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "var(--radius-md)",
                background: `${act.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ActivityIcon activityType={slot.activity_type} size="sm" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <Link
                  href={`/slots/${slot.id}`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    lineHeight: 1.3,
                  }}
                >
                  {headline}
                </Link>
                {distanceLabel ? (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      background: "var(--bg-surface-2)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {distanceLabel}
                  </span>
                ) : null}
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                {metaLine}
              </p>

              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                {formatWhen(slot.date_time, locale)}
              </p>

              {audience ? (
                <span className="badge badge-purple" style={{ marginBottom: 8 }}>
                  {audience}
                </span>
              ) : null}

              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                {Array.from({ length: totalPartySize }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      display: "inline-block",
                      background:
                        i < occupiedSpots
                          ? i === 0
                            ? act.color
                            : `${act.color}88`
                          : "var(--bg-surface-3)",
                      border: `1.5px solid ${i < occupiedSpots ? act.color : "var(--border-medium)"}`,
                    }}
                  />
                ))}
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: 2 }}>
                  {occupiedSpots}/{totalPartySize}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Avatar src={slot.host?.avatar_url} name={slot.host?.name ?? "?"} size={26} />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {slot.host?.name}
                  </span>
                  {slot.host?.reliability_score != null ? (
                    <span className="badge badge-green">
                      ✓ {Math.round(slot.host.reliability_score * 100)}%
                    </span>
                  ) : null}
                </div>
                {ctaButtons}
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
