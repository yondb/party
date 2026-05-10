"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ActivityIcon } from "./ActivityIcon";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getActivity } from "@/lib/activities";
import { applyToSlot } from "@/app/actions/applications";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { activityLabel, ICON_FEMALE, ICON_MALE, slotAudienceBadge, slotCardUi } from "@/lib/i18n-ui";

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
  max_spots: number;
  spots_taken: number;
  status: string;
  host: SlotCardHost | null;
  gender_scope?: string | null;
};

type SlotCardProps = {
  slot: SlotCardData;
  index?: number;
  /** Current user's application status for this slot */
  applicationStatus?: "none" | "pending" | "accepted" | "rejected";
  /** Current user is host */
  isHost?: boolean;
};

function formatWhen(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hostGenderIcon(g?: "male" | "female") {
  if (g === "female") return ICON_FEMALE;
  if (g === "male") return ICON_MALE;
  return null;
}

export function SlotCard({ slot, index = 0, applicationStatus = "none", isHost }: SlotCardProps) {
  const { lang } = useLanguage();
  const t = slotCardUi(lang);
  const locale = lang === "pl" ? "pl-PL" : "en-GB";
  const act = getActivity(slot.activity_type);
  const guestCap = Math.max(1, slot.max_spots - 1);
  const full = slot.status === "full" || slot.spots_taken >= guestCap;
  const totalPartySize = Math.max(2, slot.max_spots);
  const occupiedSpots = Math.min(totalPartySize, 1 + slot.spots_taken); // host + accepted guests
  const audience = slotAudienceBadge(lang, slot.gender_scope);
  const gIcon = hostGenderIcon(slot.host?.gender);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.05 }}
      whileHover={{
        y: -2,
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.8), 0 0 16px rgba(240,192,64,0.08)",
      }}
    >
      <div
        className="wow-card wow-card-hover relative flex gap-4 overflow-hidden rounded-lg p-5 sm:p-6"
        style={{ borderTop: `2px solid ${act.color}` }}
      >
        <ActivityIcon activity={act} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/slots/${slot.id}`}
            className="font-display text-xl font-semibold leading-snug text-[var(--text-bright)] hover:text-[var(--gold-bright)] sm:text-2xl"
          >
            {slot.title}
          </Link>
          <p className="mt-1 text-base text-[var(--text-secondary)]">
            {activityLabel(lang, slot.activity_type)} · {formatWhen(slot.date_time, locale)}
          </p>
          <p className="mt-1.5 text-base text-[var(--text-muted)]">📍 {slot.location_name}</p>
          {audience ? (
            <p className="mt-2 inline-block rounded-full border border-[var(--gold-dim)] bg-[var(--bg-input)] px-3 py-1 font-display text-xs uppercase tracking-[0.12em] text-[var(--gold-mid)]">
              {audience}
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-3">
            <Avatar
              src={slot.host?.avatar_url}
              name={slot.host?.name ?? "Host"}
              size={36}
            />
            <div className="min-w-0 flex-1 text-base">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[var(--text-muted)]">{t.host}</span>
                <span className="text-[var(--text-primary)]">{slot.host?.name ?? "—"}</span>
                {gIcon ? (
                  <span
                    className="inline-flex shrink-0 items-center justify-center text-2xl leading-none text-[var(--gold-bright)]"
                    aria-hidden
                  >
                    {gIcon}
                  </span>
                ) : null}
                {slot.host?.reliability_score != null ? (
                  <span className="text-[var(--status-open)]">
                    ✓{Math.round(slot.host.reliability_score * 100)}%
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-sm font-medium tracking-wide text-[var(--text-muted)]">
              <span>{t.partyMembers}</span>
              <span>
                {occupiedSpots}/{totalPartySize}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] px-2 py-2">
              {Array.from({ length: totalPartySize }, (_, i) => {
                const filled = i < occupiedSpots;
                const isHostDot = i === 0;
                return (
                  <span
                    key={`dot-${slot.id}-${i}`}
                    title={isHostDot ? t.hostDot : t.guestDot}
                    className={`h-2.5 w-2.5 rounded-full border transition ${
                      filled
                        ? isHostDot
                          ? "border-[var(--gold-bright)] bg-[var(--gold-bright)] shadow-[0_0_8px_rgba(240,192,64,0.35)]"
                          : "border-[var(--gold-mid)] bg-[var(--gold-mid)]"
                        : "border-[var(--gold-dim)] bg-[var(--bg-card)]"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            {isHost ? (
              <Button variant="secondary" fullWidth disabled>
                {t.yourQuest}
              </Button>
            ) : full ? (
              <Button variant="secondary" fullWidth disabled>
                {t.partyFull}
              </Button>
            ) : applicationStatus === "accepted" ? (
              <Button variant="secondary" fullWidth disabled className="!border-[var(--status-open)]">
                {t.accepted}
              </Button>
            ) : applicationStatus === "pending" ? (
              <Button variant="secondary" fullWidth disabled className="!border-[var(--status-pending)]">
                {t.waiting}
              </Button>
            ) : applicationStatus === "rejected" ? (
              <Button variant="secondary" fullWidth disabled className="!border-[var(--status-full)]">
                {t.declined}
              </Button>
            ) : (
              <form
                action={async () => {
                  await applyToSlot(slot.id);
                }}
              >
                <Button type="submit" variant="primary" fullWidth>
                  {t.apply}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
