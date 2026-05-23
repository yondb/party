/** Static venue categories (OpenStreetMap / map pins). */
export type PlaceCategory =
  | "running"
  | "cycling"
  | "gym"
  | "padel"
  | "tennis"
  | "basketball"
  | "hiking";

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

export const PLACE_CATEGORIES: PlaceCategory[] = [
  "running",
  "cycling",
  "gym",
  "padel",
  "tennis",
  "basketball",
  "hiking",
];

export const PLACE_CATEGORY_META: Record<
  PlaceCategory,
  { icon: string; color: string; cssVar: string }
> = {
  running: { icon: "🏃", color: "#FF6B35", cssVar: "var(--accent)" },
  cycling: { icon: "🚴", color: "#10B981", cssVar: "var(--accent)" },
  gym: { icon: "💪", color: "#EF4444", cssVar: "var(--accent)" },
  padel: { icon: "🎾", color: "#14B8A6", cssVar: "var(--accent)" },
  tennis: { icon: "🎾", color: "#65A30D", cssVar: "var(--accent)" },
  basketball: { icon: "🏀", color: "#F97316", cssVar: "var(--accent)" },
  hiking: { icon: "⛰️", color: "#84CC16", cssVar: "var(--accent)" },
};

/** Map place category → legacy slot `activity_type` for icons/filters. */
export function placeCategoryToActivityType(category: string): string {
  return category;
}

export function placeCategoryLabel(lang: "en" | "pl", category: PlaceCategory): string {
  const en: Record<PlaceCategory, string> = {
    running: "Running",
    cycling: "Cycling",
    gym: "Gym",
    padel: "Padel",
    tennis: "Tennis",
    basketball: "Basketball",
    hiking: "Hiking",
  };
  const pl: Record<PlaceCategory, string> = {
    running: "Bieganie",
    cycling: "Rower",
    gym: "Siłownia",
    padel: "Padel",
    tennis: "Tenis",
    basketball: "Koszykówka",
    hiking: "Wędrówki",
  };
  return (lang === "pl" ? pl : en)[category] ?? category;
}

export function isPlaceCategory(raw: string): raw is PlaceCategory {
  return (PLACE_CATEGORIES as string[]).includes(raw);
}

const GENERIC_PLACE_NAMES = new Set([
  "basketball spot",
  "running spot",
  "cycling spot",
  "gym spot",
  "tennis spot",
  "hiking spot",
  "padel spot",
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
