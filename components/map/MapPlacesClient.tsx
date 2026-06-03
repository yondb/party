'use client';

import nextDynamic from 'next/dynamic';
import { MapLoadingPlaceholder } from '@/components/map/MapLoadingPlaceholder';
import type { PlaceMapPin } from '@/components/map/MapPlaces';
import type { MapSlot } from '@/lib/map-slots';

const MapPlaces = nextDynamic(() => import('@/components/map/MapPlaces').then((m) => m.MapPlaces),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
  },
);

export function MapPlacesClient({
  places,
  slots,
  initialQuery,
}: {
  places: PlaceMapPin[];
  slots: MapSlot[];
  initialQuery?: string;
}) {
  return <MapPlaces places={places} slots={slots} initialQuery={initialQuery} />;
}
