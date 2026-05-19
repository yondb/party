import nextDynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { getServerLang } from "@/lib/i18n-server";
import { mapUi, pageHeaderUi } from "@/lib/i18n-ui";
import { MapLoadingPlaceholder } from "@/components/map/MapLoadingPlaceholder";
import { buildPlaceMapPins } from "@/lib/build-place-pins";

const MapPlaces = nextDynamic(
  () => import("@/components/map/MapPlaces").then((m) => m.MapPlaces),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
  },
);

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const lang = getServerLang();
  const m = mapUi(lang);
  const back = pageHeaderUi(lang);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: places }, { data: slots }] = await Promise.all([
    supabase
      .from("places")
      .select("id, name, category, lat, lng, district, is_free")
      .order("name"),
    supabase
      .from("slots")
      .select("id, place_id, date_time, max_spots, spots_taken")
      .in("status", ["open", "full"])
      .not("place_id", "is", null),
  ]);

  const placePins = buildPlaceMapPins(places ?? [], slots ?? []);

  return (
    <div className="map-page pb-6 lg:pb-0">
      <PageHeader
        title={m.title}
        backHref={user ? "/feed" : undefined}
        backLabel={back.back}
        subtitle={!user ? m.guestHint : undefined}
      />
      <MapPlaces places={placePins} />
    </div>
  );
}
