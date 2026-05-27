import { createClient } from "@/lib/supabase/server";
import { FeedExperience } from "@/components/feed/FeedExperience";
import type { SlotCardData, SlotCardHost } from "@/components/slots/SlotCard";
import { normalizeActivityKey, type ActivityKey } from "@/lib/activities";
import { getServerLang } from "@/lib/i18n-server";
import { feedUi } from "@/lib/i18n-ui";

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
    return <div className="py-10 text-center text-danger">{ui.signIn}</div>;
  }

  const { data: slots, error: slotsErr } = await supabase
    .from("slots")
    .select("*, places(name, category, district)")
    .in("status", ["open", "full"])
    .order("date_time", { ascending: true });
  if (slotsErr) return <ErrorBox lang={lang} message={slotsErr.message} />;

  const hostIds = Array.from(new Set((slots ?? []).map((s) => s.host_id)));
  const { data: hosts } = hostIds.length
    ? await supabase.from("users").select("id, name, avatar_url, reliability_score, gender").in("id", hostIds)
    : { data: [] as { id: string; name: string; avatar_url: string | null; reliability_score: number | null; gender: string | null }[] };

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
  ) as ActivityKey[];
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

  const buildHref = (next: { activity?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (next.activity) params.set("activity", next.activity);
    if (next.date) params.set("date", next.date);
    const qs = params.toString();
    return qs ? `/feed?${qs}` : "/feed";
  };

  const { data: me } = await supabase.from("users").select("name").eq("id", user.id).single();

  return (
    <FeedExperience
      userName={me?.name?.split(" ")[0] ?? "Ty"}
      cards={cards}
      allCards={allCards}
      activityOptions={activityOptions}
      dateOptions={dateOptions}
      validActivity={validActivity}
      validDate={validDate}
      buildHref={buildHref}
    />
  );
}

function ErrorBox({ lang, message }: { lang: import("@/lib/i18n-lang").Lang; message: string }) {
  return (
    <div className="py-10 text-center text-danger">
      {feedUi(lang).errorPrefix} {message}
    </div>
  );
}
