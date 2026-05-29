'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export type PickedPoint = { lat: number; lng: number; name: string };

const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

export function PlacePickerModal({
  onPick,
  onClose,
  initialName = '',
}: {
  onPick: (point: PickedPoint) => void;
  onClose: () => void;
  initialName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName] = useState(initialName);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !ref.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: ref.current,
      style: MAP_STYLE_URL,
      center: [21.0122, 52.2297],
      zoom: 11,
      attributionControl: false,
    });
    mapRef.current = map;

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setPicked({ lat, lng });
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#F5B800' })
          .setLngLat([lng, lat])
          .addTo(map);
      }
    };
    map.on('click', onClick);

    const resize = new ResizeObserver(() => map.resize());
    resize.observe(ref.current);

    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-ash-200/60 bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-ash-200/60 px-5 py-4">
          <div>
            <h2 className="font-display text-heading-md text-ash-900">Wybierz na mapie</h2>
            <p className="text-body-sm text-ash-500">Kliknij w dowolny punkt, aby upuścić pin.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="rounded-full p-1.5 text-ash-400 hover:bg-ash-100 hover:text-ash-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {token ? (
          <div ref={ref} className="h-[50vh] w-full" />
        ) : (
          <div className="flex h-[40vh] items-center justify-center p-8 text-center">
            <p className="text-body-sm text-ash-600">
              Ustaw <code className="text-honey-700">NEXT_PUBLIC_MAPBOX_TOKEN</code> w .env.local
            </p>
          </div>
        )}

        <div className="space-y-3 border-t border-ash-200/60 p-5">
          <Input
            label="Nazwa miejsca"
            placeholder="np. Boisko przy Wiśle"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {picked ? (
            <p className="flex items-center gap-1.5 font-mono text-caption text-ash-500">
              <MapPin className="size-3.5" />
              {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
            </p>
          ) : (
            <p className="text-caption text-ash-400">Nie wybrano jeszcze punktu.</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Anuluj
            </Button>
            <Button
              fullWidth
              disabled={!picked}
              onClick={() => {
                if (!picked) return;
                onPick({ ...picked, name: name.trim() || 'Wybrane miejsce' });
              }}
            >
              Użyj tego miejsca
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
