import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed/FeedList";
import { SuggestedActivities } from "@/components/feed/SuggestedActivities";
import type { SlotCardData, SlotCardHost } from "@/components/slots/SlotCard";
import { normalizeActivityKey, type ActivityKey } from "@/lib/activities";
import { getServerLang } from "@/lib/i18n-server";
import { activityLabel, feedUi } from "@/lib/i18n-ui";
import { formatFilterDate } from "@/lib/geo";

export const dynamic = "force-dynamic";

type Search = { activity?: string; date?: string };
type SlotRow = {
  id: string;
  host_id: string;
  title: string;
  activity_type: string;
  date_time: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  max_spots: number;
  spots_taken: number;
  status: string;
  gender_scope?: string | null;
  places?: { name: string; category: string; district: string | null } | null;
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

  const { data: slots, error: slotsErr } = await supabase
    .from("slots")
    .select("*, places(name, category, district)")
    .in("status", ["open", "full"])
    .order("date_time", { ascending: true });
  if (slotsErr) return <ErrorBox lang={lang} message={slotsErr.message} />;

  const { data: myApps, error: appsErr } = await supabase
    .from("applications")
    .select("slot_id, status")
    .eq("applicant_id", user.id);
  if (appsErr) return <ErrorBox lang={lang} message={appsErr.message} />;

  const appStatusBySlot: Record<string, "pending" | "accepted" | "rejected"> = {};
  (myApps ?? []).forEach((a) => {
    appStatusBySlot[a.slot_id] = a.status;
  });

  const hostIds = Array.from(new Set((slots ?? []).map((s) => s.host_id)));
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

  const allCards: SlotCardData[] = (slots ?? []).map((s: SlotRow) => ({
    id: s.id,
    title: s.title,
    activity_type: s.activity_type,
    date_time: s.date_time,
    location_name: s.location_name,
    location_lat: s.location_lat,
    location_lng: s.location_lng,
    max_spots: s.max_spots,
    spots_taken: s.spots_taken,
    status: s.status,
    gender_scope: s.gender_scope ?? "any",
    host: hostMap.get(s.host_id) ?? null,
    place_name: s.places?.name ?? null,
    place_category: s.places?.category ?? null,
    place_district: s.places?.district ?? null,
  }));

  const activityOptions = Array.from(
    new Set(allCards.map((c) => normalizeActivityKey(c.activity_type))),
  );
  const dateOptions = Array.from(new Set(allCards.map((c) => c.date_time.slice(0, 10)))).sort();
  const validActivity =
    searchParams.activity && activityOptions.includes(searchParams.activity as ActivityKey)
      ? (searchParams.activity as ActivityKey)
      : undefined;
  const validDate =
    searchParams.date && dateOptions.includes(searchParams.date) ? searchParams.date : undefined;
  const cards = allCards.filter((c) => {
    if (validActivity && normalizeActivityKey(c.activity_type) !== validActivity) return false;
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
    <div className="page-shell pb-bottom-main">
      {/* Filter chips */}
      <div className="sticky top-[calc(var(--nav-height)+env(safe-area-inset-top)+0.5rem)] z-20 -mx-1 mb-2 bg-[var(--bg-page)]/90 py-2 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        {dateOptions.length > 0 ? (
          <div className="mt-2 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterPill href={feedHref({ activity: validActivity })} label={ui.allDates} active={!validDate} />
            {dateOptions.map((d) => (
              <FilterPill
                key={d}
                href={feedHref({ activity: validActivity, date: d })}
                label={formatFilterDate(d, lang)}
                active={validDate === d}
              />
            ))}
          </div>
        ) : null}
      </div>

      <SuggestedActivities activeActivity={validActivity} validDate={validDate} />

      <FeedList
        cards={cards}
        userId={user.id}
        appStatusBySlot={appStatusBySlot}
        totalCount={allCards.length}
      />
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
    <Link href={href} className={`chip shrink-0 ${active ? "chip-active" : ""}`}>
      {label}
    </Link>
  );
}
