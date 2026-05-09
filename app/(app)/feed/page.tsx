import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SlotCard, type SlotCardData, type SlotCardHost } from "@/components/slots/SlotCard";
import { PageHeader } from "@/components/layout/PageHeader";
import type { ActivityKey } from "@/lib/activities";
import { getServerLang } from "@/lib/i18n-server";
import { activityLabel, feedUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

type Search = { activity?: string; date?: string };
type SlotRow = {
  id: string;
  host_id: string;
  title: string;
  activity_type: string;
  date_time: string;
  location_name: string;
  max_spots: number;
  spots_taken: number;
  status: string;
  gender_scope?: string | null;
};

export default async function FeedPage({ searchParams }: { searchParams: Search }) {
  const lang = getServerLang();
  const ui = feedUi(lang);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="py-10 text-center text-[var(--status-full)]">
        {ui.signIn}
      </div>
    );
  }

  const { data: hostedSlots, error: hostedErr } = await supabase
    .from("slots")
    .select("*")
    .eq("host_id", user.id)
    .order("date_time", { ascending: true });
  if (hostedErr) return <ErrorBox lang={lang} message={hostedErr.message} />;

  const { data: myApps, error: appsErr } = await supabase
    .from("applications")
    .select("slot_id, status")
    .eq("applicant_id", user.id);
  if (appsErr) return <ErrorBox lang={lang} message={appsErr.message} />;

  const appStatusBySlot = new Map<string, "pending" | "accepted" | "rejected">();
  (myApps ?? []).forEach((a) => appStatusBySlot.set(a.slot_id, a.status));
  const appliedIds = Array.from(new Set((myApps ?? []).map((a) => a.slot_id)));
  const { data: appliedSlots, error: appliedErr } = appliedIds.length
    ? await supabase.from("slots").select("*").in("id", appliedIds)
    : { data: [] as SlotRow[], error: null };
  if (appliedErr) return <ErrorBox lang={lang} message={appliedErr.message} />;

  const slotById = new Map<string, SlotRow>();
  (hostedSlots ?? []).forEach((s) => slotById.set(s.id, s));
  (appliedSlots ?? []).forEach((s) => slotById.set(s.id, s));
  const slots = Array.from(slotById.values()).sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime(),
  );

  const hostIds = Array.from(new Set(slots.map((s) => s.host_id)));
  const { data: hosts } = hostIds.length
    ? await supabase.from("users").select("id, name, avatar_url, reliability_score, gender").in("id", hostIds)
    : {
        data: [] as {
          id: string;
          name: string;
          avatar_url: string | null;
          reliability_score: number | null;
          gender: string | null;
        }[],
      };

  const hostMap = new Map<string, SlotCardHost>(
    (hosts ?? []).map((h) => [
      h.id,
      {
        id: h.id,
        name: h.name,
        avatar_url: h.avatar_url,
        reliability_score: h.reliability_score,
        gender: h.gender === "male" || h.gender === "female" ? h.gender : undefined,
      },
    ]),
  );

  const allCards: SlotCardData[] = slots.map((s) => ({
    id: s.id,
    title: s.title,
    activity_type: s.activity_type,
    date_time: s.date_time,
    location_name: s.location_name,
    max_spots: s.max_spots,
    spots_taken: s.spots_taken,
    status: s.status,
    gender_scope: s.gender_scope ?? "any",
    host: hostMap.get(s.host_id) ?? null,
  }));
  const activityOptions = Array.from(new Set(allCards.map((c) => c.activity_type as ActivityKey)));
  const dateOptions = Array.from(new Set(allCards.map((c) => c.date_time.slice(0, 10)))).sort();
  const validActivity =
    searchParams.activity && activityOptions.includes(searchParams.activity as ActivityKey)
      ? (searchParams.activity as ActivityKey)
      : undefined;
  const validDate =
    searchParams.date && dateOptions.includes(searchParams.date) ? searchParams.date : undefined;
  const cards = allCards.filter((c) => {
    if (validActivity && c.activity_type !== validActivity) return false;
    if (validDate && c.date_time.slice(0, 10) !== validDate) return false;
    return true;
  });

  const feedHref = (next: { activity?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (next.activity) params.set("activity", next.activity);
    if (next.date) params.set("date", next.date);
    const qs = params.toString();
    return qs ? `/feed?${qs}` : "/feed";
  };

  return (
    <div className="pb-6">
      <PageHeader title={ui.title} />
      <div className="relative mb-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill href={feedHref({ date: validDate })} label={ui.allActivities} active={!validActivity} />
          {activityOptions.map((k) => (
            <FilterPill
              key={k}
              href={feedHref({ activity: k, date: validDate })}
              label={activityLabel(lang, k)}
              active={validActivity === k}
            />
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill href={feedHref({ activity: validActivity })} label={ui.allDates} active={!validDate} />
        {dateOptions.map((d) => (
          <FilterPill key={d} href={feedHref({ activity: validActivity, date: d })} label={d} active={validDate === d} />
        ))}
      </div>

      {cards.length === 0 ? (
        <div className="wow-card rounded-lg p-8 text-center">
          <p className="font-display text-lg text-[var(--text-bright)]">{ui.emptyTitle}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{ui.emptyHint}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {cards.map((slot, i) => (
            <li key={slot.id}>
              <SlotCard
                slot={slot}
                index={i}
                applicationStatus={appStatusBySlot.get(slot.id) ?? "none"}
                isHost={user.id === slot.host?.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ErrorBox({ lang, message }: { lang: import("@/lib/i18n-lang").Lang; message: string }) {
  const prefix = feedUi(lang).errorPrefix;
  return (
    <div className="py-10 text-center text-[var(--status-full)]">
      {prefix} {message}
    </div>
  );
}

function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-3 py-1.5 font-display text-[11px] uppercase tracking-widest transition ${
        active
          ? "border-[var(--gold-bright)] bg-[linear-gradient(180deg,#c9963a,#8a6420)] text-[var(--bg-void)]"
          : "border-[var(--gold-dim)] text-[var(--text-secondary)] hover:border-[var(--gold-dark)]"
      }`}
    >
      {label}
    </Link>
  );
}
