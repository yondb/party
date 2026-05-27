import type { ActivityKey } from "@/lib/activities";
import type { PlaceCategory } from "@/lib/places";

export type CategoryId = ActivityKey | PlaceCategory | "football";

export type CategoryDef = {
  id: CategoryId;
  label: { pl: string; en: string };
  emoji: string;
  color: string;
  colorDark: string;
};

const CAT: Record<string, Omit<CategoryDef, "id">> = {
  running: { label: { pl: "Bieganie", en: "Running" }, emoji: "🏃", color: "#F97316", colorDark: "#EA580C" },
  cycling: { label: { pl: "Rower", en: "Cycling" }, emoji: "🚴", color: "#14B8A6", colorDark: "#0D9488" },
  basketball: { label: { pl: "Koszykówka", en: "Basketball" }, emoji: "🏀", color: "#EA580C", colorDark: "#C2410C" },
  coffee: { label: { pl: "Kawa", en: "Coffee" }, emoji: "☕", color: "#92400E", colorDark: "#78350F" },
  gym: { label: { pl: "Siłownia", en: "Gym" }, emoji: "💪", color: "#7C3AED", colorDark: "#6D28D9" },
  tennis: { label: { pl: "Tenis", en: "Tennis" }, emoji: "🎾", color: "#84CC16", colorDark: "#65A30D" },
  volleyball: { label: { pl: "Siatkówka", en: "Volleyball" }, emoji: "🏐", color: "#0EA5E9", colorDark: "#0284C7" },
  padel: { label: { pl: "Padel", en: "Padel" }, emoji: "🎾", color: "#14B8A6", colorDark: "#0D9488" },
  hiking: { label: { pl: "Wędrówki", en: "Hiking" }, emoji: "⛰️", color: "#84CC16", colorDark: "#65A30D" },
  football: { label: { pl: "Piłka", en: "Football" }, emoji: "⚽", color: "#16A34A", colorDark: "#15803D" },
  boardgames: { label: { pl: "Planszówki", en: "Board games" }, emoji: "♟️", color: "#8B5CF6", colorDark: "#7C3AED" },
  walking: { label: { pl: "Spacer", en: "Walking" }, emoji: "🚶", color: "#22C55E", colorDark: "#16A34A" },
  yoga: { label: { pl: "Joga", en: "Yoga" }, emoji: "🧘", color: "#A855F7", colorDark: "#9333EA" },
  movies: { label: { pl: "Kino", en: "Movies" }, emoji: "🎬", color: "#6366F1", colorDark: "#4F46E5" },
  food: { label: { pl: "Jedzenie", en: "Food" }, emoji: "🍜", color: "#F59E0B", colorDark: "#D97706" },
  study: { label: { pl: "Nauka", en: "Study" }, emoji: "📚", color: "#0EA5E9", colorDark: "#0284C7" },
  other: { label: { pl: "Inne", en: "Other" }, emoji: "✨", color: "#71717A", colorDark: "#52525B" },
};

export const CATEGORIES: Record<string, CategoryDef> = Object.fromEntries(
  Object.entries(CAT).map(([id, def]) => [id, { id: id as CategoryId, ...def }]),
);

export function getCategory(id: string): CategoryDef {
  return CATEGORIES[id] ?? CATEGORIES.other;
}

export function categoryColorVar(id: string): string {
  const c = getCategory(id);
  return c.color;
}
