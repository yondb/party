import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { getServerLang } from "@/lib/i18n-server";
import { pageHeaderUi } from "@/lib/i18n-ui";
import {
  PLACE_CATEGORY_META,
  placeCategoryLabel,
  type PlaceCategory,
} from "@/lib/places";
import { SlotCard, type SlotCardData, type SlotCardHost } from "@/components/slots/SlotCard";

export const dynamic = "force-dynamic";

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getServerLang();
  const back = pageHeaderUi(lang);
  const supabase = await createClient();

  const { data: place } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!place) notFound();

  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("place_id", id)
    .in("status", ["open", "full"])
    .order("date_time", { ascending: true });

  const hostIds = Array.from(new Set((slots ?? []).map((s) => s.host_id)));
  const { data: hosts } = hostIds.length
    ? await supabase.from("users").select("id, name, avatar_url, reliability_score, gender").in("id", hostIds)
    : { data: [] as SlotCardHost[] };

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

  const cards: SlotCardData[] = (slots ?? []).map((s) => ({
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
    place_name: place.name,
    place_category: place.category,
    place_district: place.district,
  }));

  const meta = PLACE_CATEGORY_META[place.category as PlaceCategory];

  return (
    <div className="pb-6">
      <PageHeader title={place.name} backHref="/map" backLabel={back.back} />
      <p className="mb-2 text-sm text-[var(--text-muted)]">
        {meta.icon} {placeCategoryLabel(lang, place.category as PlaceCategory)}
        {place.district ? ` · ${place.district}` : ""}
      </p>
      <Link
        href={`/slots/new?place_id=${place.id}`}
        className="btn-primary mb-6 inline-flex min-h-[44px] px-4 text-sm"
      >
        {lang === "pl" ? "+ Stwórz slot" : "+ Create slot"}
      </Link>
      <div className="space-y-4">
        {cards.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)]">
            {lang === "pl" ? "Brak aktywnych slotów w tym miejscu." : "No active slots at this place."}
          </p>
        ) : (
          cards.map((slot, i) => <SlotCard key={slot.id} slot={slot} index={i} />)
        )}
      </div>
    </div>
  );
}
