import { createClient } from "@/lib/supabase/server";
import { MapPlacesClient } from "@/components/map/MapPlacesClient";
import { buildPlaceMapPins } from "@/lib/build-place-pins";
import { buildMapSlots } from "@/lib/map-slots";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const supabase = await createClient();
  const [{ data: places }, { data: slots }] = await Promise.all([
    supabase
      .from("places")
      .select("id, name, category, lat, lng, district, is_free")
      .order("name"),
    supabase
      .from("slots")
      .select("id, place_id, host_id, title, date_time, max_spots, spots_taken")
      .in("status", ["open", "full"])
      .not("place_id", "is", null)
      .order("date_time", { ascending: true }),
  ]);

  const placeRows = places ?? [];
  const slotRows = slots ?? [];

  const slotIds = slotRows.map((s) => s.id);
  const { data: apps } = slotIds.length
    ? await supabase
        .from("applications")
        .select("slot_id, applicant_id")
        .in("slot_id", slotIds)
        .eq("status", "accepted")
    : { data: [] as { slot_id: string; applicant_id: string }[] };

  const acceptedBySlot = new Map<string, string[]>();
  for (const a of apps ?? []) {
    const list = acceptedBySlot.get(a.slot_id) ?? [];
    list.push(a.applicant_id);
    acceptedBySlot.set(a.slot_id, list);
  }

  const userIds = Array.from(
    new Set([
      ...slotRows.map((s) => s.host_id),
      ...(apps ?? []).map((a) => a.applicant_id),
    ]),
  );
  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, name, avatar_url").in("id", userIds)
    : { data: [] as { id: string; name: string; avatar_url: string | null }[] };

  const usersById = new Map((users ?? []).map((u) => [u.id, u]));

  const placePins = buildPlaceMapPins(placeRows, slotRows);
  const mapSlots = buildMapSlots(placeRows, slotRows, usersById, acceptedBySlot);

  return (
    <div className="relative w-full h-[calc(100dvh-var(--nav-height)-var(--dock-height))] min-h-[420px] lg:h-[calc(100dvh-var(--nav-height))] lg:min-h-[560px]">
      <MapPlacesClient places={placePins} slots={mapSlots} />
    </div>
  );
}
