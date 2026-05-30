import type { LucideIcon } from 'lucide-react';
import { Bike, Dumbbell, Trophy, Footprints, CircleDot, Mountain, Activity } from 'lucide-react';

/**
 * The categories we actually have — aligned 1:1 with the real OpenStreetMap
 * place categories (lib/places.ts PlaceCategory). Keep these in sync.
 */
export type CategoryId =
  | 'running'
  | 'cycling'
  | 'gym'
  | 'padel'
  | 'tennis'
  | 'basketball'
  | 'hiking';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;       // hex jasny
  colorDark: string;   // hex ciemny do gradientu marker
  icon: LucideIcon;
}

export const CATEGORIES: Record<CategoryId, Category> = {
  running:    { id: 'running',    label: 'Bieganie',   emoji: '🏃', color: '#F97316', colorDark: '#C2410C', icon: Footprints },
  cycling:    { id: 'cycling',    label: 'Rower',      emoji: '🚴', color: '#14B8A6', colorDark: '#0F766E', icon: Bike },
  gym:        { id: 'gym',        label: 'Siłownia',   emoji: '💪', color: '#7C3AED', colorDark: '#5B21B6', icon: Dumbbell },
  padel:      { id: 'padel',      label: 'Padel',      emoji: '🎾', color: '#0EA5E9', colorDark: '#0369A1', icon: Activity },
  tennis:     { id: 'tennis',     label: 'Tenis',      emoji: '🎾', color: '#84CC16', colorDark: '#4D7C0F', icon: Trophy },
  basketball: { id: 'basketball', label: 'Koszykówka', emoji: '🏀', color: '#EA580C', colorDark: '#9A3412', icon: CircleDot },
  hiking:     { id: 'hiking',     label: 'Wędrówki',   emoji: '⛰️', color: '#16A34A', colorDark: '#15803D', icon: Mountain },
};

export const CATEGORY_LIST: Category[] = Object.values(CATEGORIES);

/** Map legacy / activity strings → one of the categories we have. */
const ACTIVITY_TO_CATEGORY: Record<string, CategoryId> = {
  running: 'running',
  cycling: 'cycling',
  gym: 'gym',
  padel: 'padel',
  tennis: 'tennis',
  basketball: 'basketball',
  hiking: 'hiking',
  walking: 'hiking',
  yoga: 'gym',
  volleyball: 'basketball',
  football: 'basketball',
};

export function getCategory(id: string): Category {
  const key = id as CategoryId;
  if (CATEGORIES[key]) return CATEGORIES[key];
  const mapped = ACTIVITY_TO_CATEGORY[id];
  if (mapped) return CATEGORIES[mapped];
  return CATEGORIES.running;
}

export function toCategoryId(id: string): CategoryId {
  const c = getCategory(id);
  return c.id;
}
