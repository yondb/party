import type { LucideIcon } from 'lucide-react';
import {
  Bike,
  Dumbbell,
  Footprints,
  CircleDot,
  Mountain,
  Baby,
  Dog,
  TreePine,
  LandPlot,
} from 'lucide-react';
import { FREE_PLACE_CATEGORIES, placeCategoryLabel, type PlaceCategory } from '@/lib/places';
import type { Lang } from '@/lib/i18n-lang';

/**
 * Free outdoor activity categories — 1:1 with lib/places PlaceCategory.
 * Paid venues (indoor gym, padel, tennis, cafes) are excluded; those are a
 * future upsell where businesses pay for their pin on the map.
 */
export type CategoryId = PlaceCategory;

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  colorDark: string;
  icon: LucideIcon;
}

export const CATEGORIES: Record<CategoryId, Category> = {
  running:    { id: 'running',    label: 'Bieganie',           emoji: '🏃', color: '#F97316', colorDark: '#C2410C', icon: Footprints },
  cycling:    { id: 'cycling',    label: 'Rower',              emoji: '🚴', color: '#14B8A6', colorDark: '#0F766E', icon: Bike },
  basketball: { id: 'basketball', label: 'Koszykówka',         emoji: '🏀', color: '#EA580C', colorDark: '#9A3412', icon: CircleDot },
  hiking:     { id: 'hiking',     label: 'Wędrówki',           emoji: '⛰️', color: '#16A34A', colorDark: '#15803D', icon: Mountain },
  gym:        { id: 'gym',        label: 'Siłownia plenerowa', emoji: '💪', color: '#7C3AED', colorDark: '#5B21B6', icon: Dumbbell },
  playground: { id: 'playground', label: 'Plac zabaw',         emoji: '🛝', color: '#EC4899', colorDark: '#BE185D', icon: Baby },
  dog_walk:   { id: 'dog_walk',   label: 'Dog walk',           emoji: '🐕', color: '#D97706', colorDark: '#B45309', icon: Dog },
  football:   { id: 'football',   label: 'Piłka nożna',        emoji: '⚽', color: '#2563EB', colorDark: '#1D4ED8', icon: LandPlot },
  park:       { id: 'park',       label: 'Park',               emoji: '🌳', color: '#059669', colorDark: '#047857', icon: TreePine },
};

export const CATEGORY_LIST: Category[] = FREE_PLACE_CATEGORIES.map((id) => CATEGORIES[id]);

/** Localized category name — use this in UI instead of `cat.label`. */
export function categoryLabel(lang: Lang, id: CategoryId): string {
  return placeCategoryLabel(lang, id);
}

/** Map legacy / activity strings → one of the free categories we show. */
const ACTIVITY_TO_CATEGORY: Record<string, CategoryId> = {
  running: 'running',
  cycling: 'cycling',
  basketball: 'basketball',
  hiking: 'hiking',
  gym: 'gym',
  playground: 'playground',
  walking: 'dog_walk',
  dog_walk: 'dog_walk',
  football: 'football',
  soccer: 'football',
  park: 'park',
  yoga: 'gym',
  padel: 'basketball',
  tennis: 'basketball',
  volleyball: 'basketball',
};

export function getCategory(id: string): Category {
  const key = id as CategoryId;
  if (CATEGORIES[key]) return CATEGORIES[key];
  const mapped = ACTIVITY_TO_CATEGORY[id];
  if (mapped) return CATEGORIES[mapped];
  return CATEGORIES.running;
}

export function toCategoryId(id: string): CategoryId {
  return getCategory(id).id;
}
