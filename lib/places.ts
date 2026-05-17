/** Static venue categories (OpenStreetMap / map pins). */
export type PlaceCategory =
  | "running"
  | "cycling"
  | "gym"
  | "padel"
  | "tennis"
  | "basketball"
  | "hiking"
  | "board_games";

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
  "board_games",
];

export const PLACE_CATEGORY_META: Record<
  PlaceCategory,
  { icon: string; color: string; cssVar: string }
> = {
  running: { icon: "🏃", color: "#c07030", cssVar: "var(--class-running)" },
  cycling: { icon: "🚴", color: "#4a8a4a", cssVar: "var(--class-cycling)" },
  gym: { icon: "💪", color: "#9a3a3a", cssVar: "var(--class-gym)" },
  padel: { icon: "🎾", color: "#3a7a9a", cssVar: "var(--class-volleyball)" },
  tennis: { icon: "🎾", color: "#6a8a4a", cssVar: "var(--class-default)" },
  basketball: { icon: "🏀", color: "#c07030", cssVar: "var(--class-running)" },
  hiking: { icon: "⛰️", color: "#6a7a3a", cssVar: "var(--class-default)" },
  board_games: { icon: "♟️", color: "#7a3a8a", cssVar: "var(--class-boardgames)" },
};

/** Map place category → legacy slot `activity_type` for icons/filters. */
export function placeCategoryToActivityType(category: string): string {
  if (category === "board_games") return "boardgames";
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
    board_games: "Board games",
  };
  const pl: Record<PlaceCategory, string> = {
    running: "Bieganie",
    cycling: "Rower",
    gym: "Siłownia",
    padel: "Padel",
    tennis: "Tenis",
    basketball: "Koszykówka",
    hiking: "Wędrówki",
    board_games: "Planszówki",
  };
  return (lang === "pl" ? pl : en)[category] ?? category;
}

export function isPlaceCategory(raw: string): raw is PlaceCategory {
  return (PLACE_CATEGORIES as string[]).includes(raw);
}
