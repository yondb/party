import type { LucideIcon } from 'lucide-react';
import { Activity, Bike, Coffee, Dumbbell, Trophy, Footprints, Zap, CircleDot } from 'lucide-react';

export type CategoryId =
  | 'running' | 'cycling' | 'basketball' | 'coffee'
  | 'gym' | 'tennis' | 'volleyball' | 'football';

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
  basketball: { id: 'basketball', label: 'Koszykówka', emoji: '🏀', color: '#EA580C', colorDark: '#9A3412', icon: CircleDot },
  coffee:     { id: 'coffee',     label: 'Kawa',       emoji: '☕', color: '#92400E', colorDark: '#451A03', icon: Coffee },
  gym:        { id: 'gym',        label: 'Siłownia',   emoji: '💪', color: '#7C3AED', colorDark: '#5B21B6', icon: Dumbbell },
  tennis:     { id: 'tennis',     label: 'Tenis',      emoji: '🎾', color: '#84CC16', colorDark: '#4D7C0F', icon: Trophy },
  volleyball: { id: 'volleyball', label: 'Siatkówka',  emoji: '🏐', color: '#0EA5E9', colorDark: '#0369A1', icon: Activity },
  football:   { id: 'football',   label: 'Piłka',      emoji: '⚽', color: '#16A34A', colorDark: '#15803D', icon: Zap },
};

export const CATEGORY_LIST: Category[] = Object.values(CATEGORIES);

const ACTIVITY_TO_CATEGORY: Record<string, CategoryId> = {
  running: 'running',
  cycling: 'cycling',
  basketball: 'basketball',
  coffee: 'coffee',
  gym: 'gym',
  tennis: 'tennis',
  volleyball: 'volleyball',
  football: 'football',
  padel: 'tennis',
  hiking: 'running',
  boardgames: 'coffee',
  walking: 'running',
  yoga: 'gym',
  movies: 'coffee',
  food: 'coffee',
  study: 'coffee',
  other: 'basketball',
};

export function getCategory(id: string): Category {
  const key = id as CategoryId;
  if (CATEGORIES[key]) return CATEGORIES[key];
  const mapped = ACTIVITY_TO_CATEGORY[id];
  if (mapped) return CATEGORIES[mapped];
  return CATEGORIES.basketball;
}

export function toCategoryId(id: string): CategoryId {
  const c = getCategory(id);
  return c.id;
}
