"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type PickedPoint = {
  lat: number;
  lng: number;
};

type LocationPickerMapProps = {
  value: PickedPoint | null;
  onChange: (point: PickedPoint) => void;
};

export function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;

    const initialCenter: [number, number] = value
      ? [value.lng, value.lat]
      : [21.0122, 52.2297];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: value ? 12 : 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    if (value) {
      markerRef.current = new mapboxgl.Marker({ color: "#f0c040" })
        .setLngLat([value.lng, value.lat])
        .addTo(map);
    }

    const onMapClick = (e: mapboxgl.MapMouseEvent) => {
      const point = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      onChange(point);

      if (markerRef.current) {
        markerRef.current.setLngLat([point.lng, point.lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#f0c040" })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
      }
    };

    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token, onChange, value]);

  if (!token) {
    return (
      <div className="wow-card rounded-lg p-4 text-sm text-[var(--text-muted)]">
        Add <code className="text-[var(--gold-mid)]">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
        to enable picking location on map.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-60 w-full overflow-hidden rounded-lg border border-[var(--gold-dim)]"
      />
      <p className="text-xs text-[var(--text-muted)]">
        Click on map to place a pin.
      </p>
    </div>
  );
}

