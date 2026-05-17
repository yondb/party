import { isPlaceCategory, type PlaceCategory } from "@/lib/places";
import type { PlaceMapPin, PlaceSlotPreview } from "@/components/map/MapPlaces";

type PlaceRow = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  district: string | null;
  is_free: boolean;
};

type SlotRow = {
  id: string;
  place_id: string | null;
  date_time: string;
  max_spots: number;
  spots_taken: number;
};

export function buildPlaceMapPins(
  places: PlaceRow[],
  slots: SlotRow[],
): PlaceMapPin[] {
  const byPlace = new Map<string, PlaceSlotPreview[]>();
  for (const s of slots) {
    if (!s.place_id) continue;
    const list = byPlace.get(s.place_id) ?? [];
    list.push({
      id: s.id,
      date_time: s.date_time,
      max_spots: s.max_spots,
      spots_taken: s.spots_taken,
    });
    byPlace.set(s.place_id, list);
  }

  return places
    .filter((p) => isPlaceCategory(p.category))
    .map((p) => {
      const upcoming = (byPlace.get(p.id) ?? []).sort((a, b) =>
        a.date_time.localeCompare(b.date_time),
      );
      return {
        id: p.id,
        name: p.name,
        category: p.category as PlaceCategory,
        lat: p.lat,
        lng: p.lng,
        district: p.district,
        is_free: p.is_free,
        activeSlotCount: upcoming.length,
        upcomingSlots: upcoming,
      };
    });
}
