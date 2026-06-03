'use client';

import Link from 'next/link';
import { X, ArrowRight, Clock, MapPin } from 'lucide-react';
import { CATEGORIES, toCategoryId } from '@/lib/categories';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { formatStartTime, relativeStart, type MapSlot } from '@/lib/map-slots';
type Props = {
  slot: MapSlot;
  now: number;
  distanceLabel?: string | null;
  onClose: () => void;
};

export function SlotPreviewCard({ slot, now, distanceLabel, onClose }: Props) {
  const cat = CATEGORIES[toCategoryId(slot.category)];

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
          <p className="truncate font-display text-heading-md text-ash-900">{slot.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-body-sm text-ash-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{slot.placeName}</span>
            {distanceLabel ? <span>· {distanceLabel}</span> : null}
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

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {slot.participantCount > 0 ? (<AvatarStack avatars={slot.participants} size="xs" max={4} />
          ) : null}
          <span className="font-mono text-body-sm text-ash-500">{slot.participantCount}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ash-100 px-2.5 py-1 text-body-sm font-medium text-ash-700">
          <Clock className="size-3.5" />
          {formatStartTime(slot.dateTime)} · {relativeStart(slot.dateTime, now)}
        </span>
      </div>

      <Link
        href={`/slots/${slot.id}`}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-graphite text-body-sm font-medium text-surface shadow-md transition hover:bg-graphite-soft"
      >
        View slot
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
