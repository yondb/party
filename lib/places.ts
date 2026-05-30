/** Free outdoor venue categories shown on the map and in slot creation. */
export type PlaceCategory =
  | "running"
  | "cycling"
  | "basketball"
  | "hiking"
  | "gym"; // outdoor street-workout / fitness stations only — NOT indoor gyms

/** Categories we show in the app (free, no venue fee). */
export const FREE_PLACE_CATEGORIES: PlaceCategory[] = [
  "running",
  "cycling",
  "basketball",
  "hiking",
  "gym",
];

/** @deprecated use FREE_PLACE_CATEGORIES */
export const PLACE_CATEGORIES = FREE_PLACE_CATEGORIES;

/** Paid venue types reserved for future business upsell (hidden from map until is_free + sponsorship). */
export const PAID_PLACE_CATEGORIES = ["padel", "tennis", "coffee", "cafe"] as const;

export type PlaceRow = {
  id: string;
  name: string;
  description: string | null;
  category: PlaceCategory;
  lat: number;
  lng: number;
  city: string;
  district: string | null;
  is_free: boolean;
  osm_id: string | null;
};

export const PLACE_CATEGORY_META: Record<
  PlaceCategory,
  { icon: string; color: string; cssVar: string }
> = {
  running: { icon: "🏃", color: "#FF6B35", cssVar: "var(--accent)" },
  cycling: { icon: "🚴", color: "#10B981", cssVar: "var(--accent)" },
  basketball: { icon: "🏀", color: "#F97316", cssVar: "var(--accent)" },
  hiking: { icon: "⛰️", color: "#84CC16", cssVar: "var(--accent)" },
  gym: { icon: "💪", color: "#7C3AED", cssVar: "var(--accent)" },
};

/** Map place category → legacy slot `activity_type` for icons/filters. */
export function placeCategoryToActivityType(category: string): string {
  return category;
}

export function placeCategoryLabel(lang: "en" | "pl", category: PlaceCategory): string {
  const en: Record<PlaceCategory, string> = {
    running: "Running",
    cycling: "Cycling",
    basketball: "Basketball",
    hiking: "Hiking",
    gym: "Outdoor gym",
  };
  const pl: Record<PlaceCategory, string> = {
    running: "Bieganie",
    cycling: "Rower",
    basketball: "Koszykówka",
    hiking: "Wędrówki",
    gym: "Siłownia plenerowa",
  };
  return (lang === "pl" ? pl : en)[category] ?? category;
}

export function isPlaceCategory(raw: string): raw is PlaceCategory {
  return (FREE_PLACE_CATEGORIES as string[]).includes(raw);
}

export function isFreePlaceCategory(raw: string): raw is PlaceCategory {
  return isPlaceCategory(raw);
}

const GENERIC_PLACE_NAMES = new Set([
  "basketball spot",
  "running spot",
  "cycling spot",
  "gym spot",
  "outdoor gym spot",
  "hiking spot",
  "volleyball spot",
]);

/** OSM imports often use generic English names — show category + district instead. */
export function displayPlaceName(
  place: { name: string; category: PlaceCategory; district: string | null },
  lang: "en" | "pl",
): string {
  if (GENERIC_PLACE_NAMES.has(place.name.toLowerCase().trim())) {
    const catLabel = placeCategoryLabel(lang, place.category);
    return place.district ? `${catLabel} · ${place.district}` : catLabel;
  }
  return place.name;
}
