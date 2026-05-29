import { isPlaceCategory, type PlaceCategory } from "@/lib/places";
import type { Lang } from "@/lib/i18n-lang";

export type MapSlotParticipant = { src: string | null; name: string };

export type MapSlot = {
  id: string;
  title: string;
  category: PlaceCategory;
  placeId: string;
  placeName: string;
  district: string | null;
  lat: number;
  lng: number;
  dateTime: string;
  maxSpots: number;
  spotsTaken: number;
  participants: MapSlotParticipant[];
  participantCount: number;
};

type PlaceRow = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  district: string | null;
};

type SlotRow = {
  id: string;
  place_id: string | null;
  host_id: string;
  title: string;
  date_time: string;
  max_spots?: number;
  spots_taken?: number;
};

type UserRow = { id: string; name: string; avatar_url: string | null };

export function buildMapSlots(
  places: PlaceRow[],
  slots: SlotRow[],
  usersById: Map<string, UserRow>,
  acceptedBySlot: Map<string, string[]>,
): MapSlot[] {
  const placeById = new Map<string, PlaceRow>();
  for (const p of places) {
    if (!isPlaceCategory(p.category)) continue;
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
    placeById.set(p.id, p);
  }

  const result: MapSlot[] = [];
  for (const s of slots) {
    if (!s.place_id) continue;
    const place = placeById.get(s.place_id);
    if (!place) continue;

    const memberIds = [s.host_id, ...(acceptedBySlot.get(s.id) ?? [])];
    const seen = new Set<string>();
    const participants: MapSlotParticipant[] = [];
    for (const uid of memberIds) {
      if (seen.has(uid)) continue;
      seen.add(uid);
      const u = usersById.get(uid);
      participants.push({ src: u?.avatar_url ?? null, name: u?.name ?? "?" });
    }

    result.push({
      id: s.id,
      title: s.title,
      category: place.category as PlaceCategory,
      placeId: place.id,
      placeName: place.name,
      district: place.district,
      lat: place.lat,
      lng: place.lng,
      dateTime: s.date_time,
      maxSpots: s.max_spots ?? 2,
      spotsTaken: s.spots_taken ?? 0,
      participants,
      participantCount: participants.length,
    });
  }

  return result.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
}

/** Hours from `now` until the slot start (can be negative if already started). */
export function hoursUntil(dateTime: string, now: number): number {
  return (new Date(dateTime).getTime() - now) / 3_600_000;
}

export type SlotBucket = "now" | "today" | "week";

export function bucketForSlot(dateTime: string, now: number): SlotBucket {
  const h = hoursUntil(dateTime, now);
  if (h <= 1) return "now";
  if (h <= 6) return "today";
  return "week";
}

/** e.g. "za 2 godz", "za 30 min", "teraz". */
export function relativeStart(dateTime: string, now: number, lang: Lang): string {
  const diffMs = new Date(dateTime).getTime() - now;
  const mins = Math.round(diffMs / 60_000);
  if (mins <= 0) return lang === "pl" ? "teraz" : "now";
  if (mins < 60) return lang === "pl" ? `za ${mins} min` : `in ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return lang === "pl" ? `za ${hrs} godz` : `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return lang === "pl" ? `za ${days} dni` : `in ${days}d`;
}

export function formatStartTime(dateTime: string, lang: Lang): string {
  const d = new Date(dateTime);
  if (Number.isNaN(d.getTime())) return "--:--";
  return new Intl.DateTimeFormat(lang === "pl" ? "pl-PL" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
