/** Free outdoor venue categories shown on the map and in slot creation. */
export type PlaceCategory =
  | "running"
  | "cycling"
  | "basketball"
  | "hiking"
  | "gym" // outdoor street-workout / fitness stations only — NOT indoor gyms
  | "playground"
  | "walking"
  | "football"
  | "park";

/** Categories we show in the app (free, no venue fee). */
export const FREE_PLACE_CATEGORIES: PlaceCategory[] = [
  "running",
  "cycling",
  "basketball",
  "hiking",
  "gym",
  "playground",
  "walking",
  "football",
  "park",
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
  playground: { icon: "🛝", color: "#EC4899", cssVar: "var(--accent)" },
  walking: { icon: "🚶", color: "#22C55E", cssVar: "var(--accent)" },
  football: { icon: "⚽", color: "#2563EB", cssVar: "var(--accent)" },
  park: { icon: "🌳", color: "#059669", cssVar: "var(--accent)" },
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
    playground: "Playground",
    walking: "Walks",
    football: "Football",
    park: "Park meetup",
  };
  const pl: Record<PlaceCategory, string> = {
    running: "Bieganie",
    cycling: "Rower",
    basketball: "Koszykówka",
    hiking: "Wędrówki",
    gym: "Siłownia plenerowa",
    playground: "Plac zabaw",
    walking: "Spacery",
    football: "Piłka nożna",
    park: "Park",
  };
  return (lang === "pl" ? pl : en)[category] ?? category;
}

export function isPlaceCategory(raw: string): raw is PlaceCategory {
  return (FREE_PLACE_CATEGORIES as string[]).includes(raw);
}

export function isFreePlaceCategory(raw: string): raw is PlaceCategory {
  return isPlaceCategory(raw);
}

const GENERIC_SPOT_LABELS: Partial<Record<PlaceCategory, { en: string; pl: string }>> = {
  gym: { en: "outdoor gym", pl: "siłownia plenerowa" },
  playground: { en: "playground", pl: "plac zabaw" },
  walking: { en: "walking route", pl: "trasa spacerowa" },
  football: { en: "football pitch", pl: "boisko piłkarskie" },
  park: { en: "park", pl: "park" },
};

const GENERIC_PLACE_NAMES = new Set([
  "basketball spot",
  "running spot",
  "cycling spot",
  "gym spot",
  "outdoor gym spot",
  "hiking spot",
  "volleyball spot",
  "playground spot",
  "walking spot",
  "football spot",
  "park spot",
  ...Object.values(GENERIC_SPOT_LABELS).flatMap((l) => [l.en, l.pl]),
]);

/** OSM imports often use generic English names — show category + district instead. */
export function displayPlaceName(
  place: { name: string; category: PlaceCategory; district: string | null },
  lang: "en" | "pl",
): string {
  const normalized = place.name.toLowerCase().trim();
  const genericLabel = GENERIC_SPOT_LABELS[place.category]?.[lang === "pl" ? "pl" : "en"];
  if (
    GENERIC_PLACE_NAMES.has(normalized) ||
    (genericLabel && normalized === genericLabel) ||
    normalized === `${place.category} spot`
  ) {
    const catLabel = placeCategoryLabel(lang, place.category);
    return place.district ? `${catLabel} · ${place.district}` : catLabel;
  }
  return place.name;
}
