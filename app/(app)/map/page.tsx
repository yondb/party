import nextDynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = createClient();

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
    <div
      className="relative -mx-5 w-[calc(100%+2.5rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
      style={{
        height: "calc(100dvh - var(--nav-height) - var(--dock-height) - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem)",
        minHeight: "420px",
      }}
    >
      <MapPlaces places={placePins} />
    </div>
  );
}
