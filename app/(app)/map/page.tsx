import nextDynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { getServerLang } from "@/lib/i18n-server";
import { mapUi, pageHeaderUi } from "@/lib/i18n-ui";
import { MapLoadingPlaceholder } from "@/components/map/MapLoadingPlaceholder";

const MapSlots = nextDynamic(() => import("@/components/map/MapSlots").then((m) => m.MapSlots), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder />,
});

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const lang = getServerLang();
  const m = mapUi(lang);
  const back = pageHeaderUi(lang);
  const supabase = createClient();
  type GenderFilter = "female" | "male";
  const { data: slots } = await supabase
    .from("slots")
    .select("id, title, host_id, location_lat, location_lng, activity_type, date_time, gender_scope")
    .in("status", ["open", "full"]);

  const hostIds = Array.from(new Set((slots ?? []).map((s) => s.host_id)));
  const { data: hosts } = hostIds.length
    ? await supabase.from("users").select("id, gender").in("id", hostIds)
    : { data: [] as { id: string; gender: GenderFilter | null }[] };
  const hostGenderMap = new Map<string, GenderFilter | null>(
    (hosts ?? []).map((h) => [h.id, h.gender as GenderFilter | null]),
  );

  const pins =
    slots?.map((s) => ({
      id: s.id,
      title: s.title,
      lat: s.location_lat,
      lng: s.location_lng,
      activity_type: s.activity_type,
      date_time: s.date_time,
      host_gender: hostGenderMap.get(s.host_id) ?? null,
      gender_scope: ((s as { gender_scope?: string }).gender_scope ?? "any") as "any" | "female" | "male",
    })) ?? [];

  return (
    <div className="pb-6">
      <PageHeader title={m.title} backHref="/feed" backLabel={back.back} />
      <MapSlots pins={pins} />
    </div>
  );
}
