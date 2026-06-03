'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export type PickedPoint = { lat: number; lng: number; name: string };

export type PlacePickerPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  district?: string | null;
};

export type PlacePick =
  | { kind: 'existing'; id: string; name: string; lat: number; lng: number }
  | { kind: 'custom'; lat: number; lng: number; name: string };

const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const SOURCE_ID = 'picker-places';
const LAYER_ID = 'picker-places-circles';

export function PlacePickerModal({
  places,
  onPick,
  onClose,
  initialName = '',
}: {
  places: PlacePickerPlace[];
  onPick: (pick: PlacePick) => void;
  onClose: () => void;
  initialName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const placesRef = useRef(places);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedExisting, setSelectedExisting] = useState<PlacePickerPlace | null>(null);
  const [name, setName] = useState(initialName);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  placesRef.current = places;

  const geoJson = useMemo((): GeoJSON.FeatureCollection => ({
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        id: p.id,
        properties: { id: p.id, name: p.name },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      })),
    }),
    [places],
  );

  useEffect(() => {
    if (!token || !ref.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: ref.current,
      style: MAP_STYLE_URL,
      center: [-97.7431, 30.2672],
      zoom: 11,
      attributionControl: false,
    });
    mapRef.current = map;

    const onMapClick = (e: mapboxgl.MapMouseEvent) => {
      const hits = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] });
      if (hits.length > 0) {
        const id = hits[0].properties?.id as string | undefined;
        const place = placesRef.current.find((p) => p.id === id);
        if (place) {
          setSelectedExisting(place);
          setPicked(null);
          setName(place.name);
          markerRef.current?.remove();
          markerRef.current = null;
          map.flyTo({ center: [place.lng, place.lat], zoom: 15, duration: 600 });
          return;
        }
      }

      const { lng, lat } = e.lngLat;
      setSelectedExisting(null);
      setPicked({ lat, lng });
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#F5B800', anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);
      }
    };

    map.on('load', () => {
      map.addSource(SOURCE_ID, { type: 'geojson', data: geoJson, promoteId: 'id' });
      map.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': 7,
          'circle-color': '#FF6B35',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.on('click', onMapClick);
      map.on('mouseenter', LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });

      if (placesRef.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        for (const p of placesRef.current) bounds.extend([p.lng, p.lat]);
        map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 0 });
      }

      map.resize();
    });

    const resize = new ResizeObserver(() => map.resize());
    resize.observe(ref.current);

    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token, geoJson]);

  const canConfirm = Boolean(selectedExisting || picked);

  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-ash-200/60 bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-ash-200/60 px-5 py-4">
          <div>
            <h2 className="font-display text-heading-md text-ash-900">Pick on map</h2>
            <p className="text-body-sm text-ash-500">
              Click an orange pin (existing place) or anywhere on the map to drop a new pin.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ash-400 hover:bg-ash-100 hover:text-ash-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {token ? (<div ref={ref} className="h-[50vh] min-h-[280px] w-full" />
        ) : (<div className="flex h-[40vh] items-center justify-center p-8 text-center">
            <p className="text-body-sm text-ash-600">
              Set <code className="text-honey-700">NEXT_PUBLIC_MAPBOX_TOKEN</code> in .env.local
            </p>
          </div>
        )}

        <div className="space-y-3 border-t border-ash-200/60 p-5">
          <Input
            label="Place name"
            placeholder="e.g. Riverside basketball court"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {selectedExisting ? (<p className="flex items-center gap-1.5 text-body-sm text-success">
              <MapPin className="size-3.5 shrink-0" />
              Selected: <span className="font-medium text-ash-900">{selectedExisting.name}</span>
              {selectedExisting.district ? ` · ${selectedExisting.district}` : ''}
            </p>
          ) : picked ? (<p className="flex items-center gap-1.5 font-mono text-caption text-ash-500">
              <MapPin className="size-3.5" />
              New pin: {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
            </p>
          ) : (<p className="text-caption text-ash-400">
              {places.length > 0
                ? `${places.length} places on the map — click a pin or the map.`
                : 'No pin selected yet.'}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              fullWidth
              disabled={!canConfirm}
              onClick={() => {
                if (selectedExisting) {
                  onPick({
                    kind: 'existing',
                    id: selectedExisting.id,
                    name: selectedExisting.name,
                    lat: selectedExisting.lat,
                    lng: selectedExisting.lng,
                  });
                  return;
                }
                if (!picked) return;
                onPick({
                  kind: 'custom',
                  lat: picked.lat,
                  lng: picked.lng,
                  name: name.trim() || 'Selected place',
                });
              }}
            >
              Use this place
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
