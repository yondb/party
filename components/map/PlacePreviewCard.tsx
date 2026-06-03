'use client';

import Link from 'next/link';
import { X, MapPin, Plus } from 'lucide-react';
import { CATEGORIES, toCategoryId } from '@/lib/categories';
import { displayPlaceName, placeCategoryLabel, type PlaceCategory } from '@/lib/places';

type Props = {
  place: {
    id: string;
    name: string;
    category: PlaceCategory;
    district: string | null;
    activeSlotCount: number;
  };
  onClose: () => void;
};

export function PlacePreviewCard({ place, onClose }: Props) {
  const cat = CATEGORIES[toCategoryId(place.category)];
  const displayName = displayPlaceName(place);

  return (<div className="pointer-events-auto w-[min(420px,calc(100vw-2rem))] rounded-3xl border border-ash-200/60 bg-surface p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{ backgroundColor: `${cat.color}1A` }}
          aria-hidden
        >
          {cat.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-heading-md text-ash-900">{displayName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-body-sm text-ash-500">
            <MapPin className="size-3.5 shrink-0" />
            {placeCategoryLabel(place.category)}
            {place.district ? ` · ${place.district}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-full p-1 text-ash-400 hover:bg-ash-100 hover:text-ash-700 transition"
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="mt-3 text-body-sm text-ash-600">
        {place.activeSlotCount > 0
          ? `${place.activeSlotCount} active slots here.`
          : 'No slots yet — you can create the first one.'}
      </p>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/slots/new?place_id=${encodeURIComponent(place.id)}`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-graphite text-body-sm font-medium text-surface shadow-md transition hover:bg-graphite-soft"
        >
          <Plus className="size-4" />
          New slot
        </Link>
        <Link
          href={`/places/${encodeURIComponent(place.id)}`}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-ash-200 px-4 text-body-sm font-medium text-ash-700 hover:bg-ash-50"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
