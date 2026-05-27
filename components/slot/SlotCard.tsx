'use client';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { CATEGORIES, type CategoryId, toCategoryId } from '@/lib/categories';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTime, formatDistance } from '@/lib/utils';

export interface SlotData {
  id: string;
  category: CategoryId;
  title: string;
  startAt: string;
  placeName: string;
  distanceMeters: number;
  host: { name: string; avatarUrl?: string | null; reliability: number };
  participants: Array<{ name: string; avatarUrl?: string | null }>;
  capacity: number;
  featured?: boolean;
}

interface Props {
  slot: SlotData;
  compact?: boolean;
}

export function SlotCard({ slot, compact }: Props) {
  const cat = CATEGORIES[slot.category];
  const taken = slot.participants.length;
  const isFull = taken >= slot.capacity;

  return (
    <Link href={`/slots/${slot.id}`} className="block group">
      <div className="relative overflow-hidden rounded-3xl border border-ash-200/50 bg-surface shadow-sm transition-all duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-ash-300/60 hover:shadow-md">
        <span
          className="absolute left-0 top-0 h-full w-1.5 group-hover:w-2 transition-all duration-200"
          style={{ backgroundColor: cat.color }}
          aria-hidden
        />

        <div className="p-5 pl-7">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="size-10 rounded-2xl flex items-center justify-center text-lg"
                style={{ backgroundColor: `${cat.color}1A` }}
              >
                <span aria-hidden>{cat.emoji}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-caption uppercase tracking-wider text-ash-500">
                  {cat.label}
                </span>
                {slot.featured && <Badge variant="slash">featured</Badge>}
              </div>
            </div>
            {isFull && <Badge variant="default">Pełne</Badge>}
          </div>

          <h3 className="font-display text-display-md text-ash-900 mb-3 line-clamp-2">
            {slot.title}
          </h3>

          {!compact && (
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-ash-600">
                <Calendar className="size-4 shrink-0" />
                <span className="font-mono text-body-sm">
                  {formatDate(slot.startAt)} · {formatTime(slot.startAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-ash-600">
                <MapPin className="size-4 shrink-0" />
                <span className="font-mono text-body-sm">
                  {slot.placeName} · {formatDistance(slot.distanceMeters)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Avatar src={slot.host.avatarUrl} name={slot.host.name} size="xs" />
            <span className="text-body-sm text-ash-700 font-medium">{slot.host.name}</span>
            <span className="text-body-sm text-ash-400">·</span>
            <span className="text-body-sm font-mono text-success">⭐ {slot.host.reliability}%</span>
          </div>

          <div className="border-t border-ash-100 -mx-5 mb-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AvatarStack avatars={slot.participants} size="xs" max={3} />
              <span className="text-body-sm text-ash-500">
                <span className="font-mono font-semibold text-ash-900">{taken}</span>
                <span className="font-mono">/{slot.capacity}</span> miejsc
              </span>
            </div>
            <Button size="sm" variant={isFull ? 'secondary' : 'primary'} disabled={isFull}>
              {isFull ? 'Pełne' : 'Dołącz'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function slotDataFromLegacy(slot: {
  id: string;
  title: string;
  activity_type: string;
  date_time: string;
  location_name: string;
  max_spots: number;
  spots_taken: number;
  place_name?: string | null;
  place_category?: string | null;
  host: { name: string; avatar_url?: string | null; reliability_score?: number | null } | null;
}): SlotData {
  const category = toCategoryId(slot.place_category ?? slot.activity_type);
  return {
    id: slot.id,
    category,
    title: slot.place_name ?? slot.title,
    startAt: slot.date_time,
    placeName: slot.place_name ?? slot.location_name,
    distanceMeters: 0,
    host: {
      name: slot.host?.name ?? '?',
      avatarUrl: slot.host?.avatar_url,
      reliability: Math.round((slot.host?.reliability_score ?? 1) * 100),
    },
    participants: Array.from({ length: Math.min(slot.spots_taken, 3) }, (_, i) => ({
      name: `U${i + 1}`,
    })),
    capacity: slot.max_spots,
  };
}
