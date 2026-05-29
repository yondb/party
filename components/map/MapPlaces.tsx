"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import type { GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  PLACE_CATEGORIES,
  PLACE_CATEGORY_META,
  placeCategoryLabel,
  displayPlaceName,
  type PlaceCategory,
} from "@/lib/places";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { mapUi } from "@/lib/i18n-ui";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import { MapMarker, MapClusterMarker } from "@/components/map/MapMarker";
import { SlotPreviewCard } from "@/components/map/SlotPreviewCard";
import { CATEGORIES, toCategoryId } from "@/lib/categories";
import { AvatarStack } from "@/components/ui/AvatarStack";
import {
  bucketForSlot,
  relativeStart,
  formatStartTime,
  type MapSlot,
  type SlotBucket,
} from "@/lib/map-slots";

export type PlaceSlotPreview = {
  id: string;
  date_time: string;
  max_spots: number;
  spots_taken: number;
};

export type PlaceMapPin = {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  district: string | null;
  is_free: boolean;
  activeSlotCount: number;
  upcomingSlots: PlaceSlotPreview[];
};

const SOURCE_ID = "places";
/** Off-white CARTO Voyager basemap (no Mapbox styling needed). */
const MAP_STYLE_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

type MarkerEntry = {
  marker: mapboxgl.Marker;
  root: Root;
  type: "cluster" | "point";
  placeId?: string;
};

function buildPopupHtml(
  p: PlaceMapPin,
  lang: "en" | "pl",
  m: ReturnType<typeof mapUi>,
): string {
  const meta = PLACE_CATEGORY_META[p.category];
  const catLabel = placeCategoryLabel(lang, p.category);
  const districtLine = p.district ? ` · ${escapeHtml(p.district)}` : "";
  const locale = lang === "pl" ? "pl-PL" : "en-US";
  const slotsHtml =
    p.upcomingSlots.length === 0
      ? `<p class="lfparty-map-popup__meta">${escapeHtml(m.popupNoSlots)}</p>`
      : p.upcomingSlots
          .slice(0, 4)
          .map((s) => {
            const when = new Date(s.date_time).toLocaleString(locale, {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
            const total = Math.max(2, s.max_spots);
            const occupied = Math.min(total, 1 + s.spots_taken);
            return `<a class="lfparty-map-popup__slot-line" href="/slots/${escapeHtml(s.id)}">${escapeHtml(when)} · ${occupied}/${total}</a>`;
          })
          .join("");
  const badge =
    p.activeSlotCount > 0
      ? ` <span class="lfparty-map-popup__badge">${p.activeSlotCount}</span>`
      : "";
  const displayName = displayPlaceName(p, lang);
  return `
    <div class="lfparty-map-popup">
      <p class="lfparty-map-popup__title">${meta.icon} ${escapeHtml(displayName)}${badge}</p>
      <p class="lfparty-map-popup__meta">${escapeHtml(catLabel)}${districtLine}</p>
      <p class="lfparty-map-popup__section">${escapeHtml(m.popupUpcoming)}</p>
      ${slotsHtml}
      <div class="lfparty-map-popup__actions">
        <a class="lfparty-map-popup__link" href="/slots/new?place_id=${encodeURIComponent(p.id)}">${escapeHtml(m.popupCreateSlot)}</a>
        <a class="lfparty-map-popup__link lfparty-map-popup__link--muted" href="/places/${encodeURIComponent(p.id)}">${escapeHtml(m.popupViewAll)}</a>
      </div>
    </div>`;
}

function buildGeoJson(places: PlaceMapPin[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: places.map((p) => ({
      type: "Feature",
      properties: {
        id: p.id,
        category: p.category,
        activeSlotCount: p.activeSlotCount,
        color: PLACE_CATEGORY_META[p.category].color,
      },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  };
}

export function MapPlaces({
  places,
  slots,
  initialQuery = "",
}: {
  places: PlaceMapPin[];
  slots: MapSlot[];
  initialQuery?: string;
}) {
  const { lang } = useLanguage();
  const m = mapUi(lang);
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const youMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const placesByIdRef = useRef<Map<string, PlaceMapPin>>(new Map());
  const markersRef = useRef<Record<string, MarkerEntry>>({});
  const markersOnScreenRef = useRef<Record<string, MarkerEntry>>({});
  const activePlaceIdRef = useRef<string | null>(null);
  const flyToPlaceRef = useRef<((place: PlaceMapPin) => void) | null>(null);
  const mapReadyRef = useRef(false);
  const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [category, setCategory] = useState<"all" | PlaceCategory>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [onlyOpenSlots, setOnlyOpenSlots] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(30);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [mapError, setMapError] = useState<string | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  function requestMyLocation() {
    if (!navigator.geolocation) {
      setLocationError(m.locationDenied);
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationEnabled(true);
      },
      () => {
        setLocationError(m.locationDenied);
        setLocationEnabled(false);
        setMyPosition(null);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 },
    );
  }

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return places.filter((place) => {
      if (category !== "all" && place.category !== category) return false;
      if (q) {
        const name = displayPlaceName(place, lang).toLowerCase();
        if (!name.includes(q) && !(place.district?.toLowerCase().includes(q) ?? false)) return false;
      }
      if (onlyOpenSlots) {
        const hasOpen = place.upcomingSlots.some((s) => {
          const cap = Math.max(1, s.max_spots - 1);
          return s.spots_taken < cap;
        });
        if (!hasOpen) return false;
      }
      if (dateFilter) {
        const match = place.upcomingSlots.some((s) => {
          const ymd = new Date(s.date_time).toISOString().slice(0, 10);
          return ymd === dateFilter;
        });
        if (!match) return false;
      }
      if (locationEnabled && myPosition) {
        const km = distanceKm(myPosition.lat, myPosition.lng, place.lat, place.lng);
        if (km > radiusKm) return false;
      }
      return true;
    });
  }, [places, category, searchQuery, dateFilter, onlyOpenSlots, locationEnabled, myPosition, radiusKm, lang]);

  const geoJson = useMemo(() => buildGeoJson(filteredPlaces), [filteredPlaces]);
  const geoJsonRef = useRef(geoJson);
  geoJsonRef.current = geoJson;

  useEffect(() => {
    placesByIdRef.current = new Map(filteredPlaces.map((p) => [p.id, p]));
  }, [filteredPlaces]);

  const slotDistanceLabel = useCallback(
    (slot: MapSlot): string | null => {
      if (!locationEnabled || !myPosition) return null;
      const km = distanceKm(myPosition.lat, myPosition.lng, slot.lat, slot.lng);
      return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
    },
    [locationEnabled, myPosition],
  );

  const groupedSlots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = slots.filter((slot) => {
      if (category !== "all" && slot.category !== category) return false;
      if (q) {
        const hay = `${slot.title} ${slot.placeName} ${slot.district ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (dateFilter) {
        const ymd = new Date(slot.dateTime).toISOString().slice(0, 10);
        if (ymd !== dateFilter) return false;
      }
      if (onlyOpenSlots) {
        const cap = Math.max(1, slot.maxSpots - 1);
        if (slot.spotsTaken >= cap) return false;
      }
      if (locationEnabled && myPosition) {
        const km = distanceKm(myPosition.lat, myPosition.lng, slot.lat, slot.lng);
        if (km > radiusKm) return false;
      }
      return true;
    });

    const buckets: Record<SlotBucket, MapSlot[]> = { now: [], today: [], week: [] };
    for (const slot of filtered) buckets[bucketForSlot(slot.dateTime, now)].push(slot);
    return buckets;
  }, [slots, category, searchQuery, dateFilter, onlyOpenSlots, locationEnabled, myPosition, radiusKm, now]);

  const totalSlots =
    groupedSlots.now.length + groupedSlots.today.length + groupedSlots.week.length;

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId],
  );

  const openPlacePopup = useCallback(
    (place: PlaceMapPin) => {
      const map = mapRef.current;
      if (!map) return;
      popupRef.current?.remove();
      const html = buildPopupHtml(place, lang, m);
      const popup = new mapboxgl.Popup({ offset: 16, className: "lfparty-map-popup-wrap" })
        .setLngLat([place.lng, place.lat])
        .setHTML(html)
        .addTo(map);
      popupRef.current = popup;
      setActivePlaceId(place.id);
    },
    [lang, m],
  );

  const flyToPlace = useCallback(
    (place: PlaceMapPin) => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({ center: [place.lng, place.lat], zoom: 15, duration: 900 });
      openPlacePopup(place);
    },
    [openPlacePopup],
  );

  useEffect(() => {
    flyToPlaceRef.current = flyToPlace;
  }, [flyToPlace]);

  const selectSlot = useCallback((slot: MapSlot) => {
    setSelectedSlotId(slot.id);
    setActivePlaceId(slot.placeId);
    const map = mapRef.current;
    if (map) {
      popupRef.current?.remove();
      map.flyTo({ center: [slot.lng, slot.lat], zoom: 15, duration: 900 });
    }
    setSheetHeight((h) => (h < 50 ? 55 : h));
  }, []);

  const dragRef = useRef<{ startY: number; startH: number } | null>(null);
  const onSheetPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startH: sheetHeight };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onSheetPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.clientY;
    const vh = (dy / window.innerHeight) * 100;
    setSheetHeight(Math.min(80, Math.max(30, dragRef.current.startH + vh)));
  };
  const onSheetPointerUp = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setSheetHeight((h) => (h > 55 ? 80 : 30));
  };

  const renderPointMarker = useCallback((entry: MarkerEntry, place: PlaceMapPin) => {
    entry.root.render(
      <MapMarker
        category={toCategoryId(place.category)}
        count={place.activeSlotCount}
        active={activePlaceIdRef.current === place.id}
        onClick={() => flyToPlaceRef.current?.(place)}
      />,
    );
  }, []);

  /** Render cluster + point capsule markers from the clustered source on the fly. */
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;

    const newMarkers: Record<string, MarkerEntry> = {};
    const features = map.querySourceFeatures(SOURCE_ID);

    for (const feature of features) {
      if (feature.geometry.type !== "Point") continue;
      const props = feature.properties ?? {};
      const isCluster = Boolean(props.cluster);
      const id = isCluster ? `cluster-${props.cluster_id}` : `pt-${props.id}`;
      if (newMarkers[id]) continue;

      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      let entry = markersRef.current[id];

      if (!entry) {
        const el = document.createElement("div");
        const root = createRoot(el);
        const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords);
        entry = { marker, root, type: isCluster ? "cluster" : "point" };
        markersRef.current[id] = entry;

        if (isCluster) {
          const clusterId = props.cluster_id as number;
          const count = props.point_count as number;
          root.render(
            <MapClusterMarker
              count={count}
              onClick={() => {
                source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                  if (err || zoom == null) return;
                  map.easeTo({ center: coords, zoom });
                });
              }}
            />,
          );
        } else {
          const place = placesByIdRef.current.get(props.id as string);
          if (place) {
            entry.placeId = place.id;
            renderPointMarker(entry, place);
          }
        }
      } else {
        entry.marker.setLngLat(coords);
      }

      newMarkers[id] = entry;
      if (!markersOnScreenRef.current[id]) entry.marker.addTo(map);
    }

    for (const id in markersOnScreenRef.current) {
      if (!newMarkers[id]) {
        const stale = markersRef.current[id];
        stale?.marker.remove();
        if (stale) {
          const root = stale.root;
          setTimeout(() => root.unmount(), 0);
          delete markersRef.current[id];
        }
      }
    }
    markersOnScreenRef.current = newMarkers;
  }, [renderPointMarker]);

  useEffect(() => {
    if (!token || !ref.current) return;

    mapboxgl.accessToken = token;
    const center: [number, number] = myPosition
      ? [myPosition.lng, myPosition.lat]
      : places[0]
        ? [places[0].lng, places[0].lat]
        : [21.0122, 52.2297];

    setMapError(null);
    const map = new mapboxgl.Map({
      container: ref.current,
      style: MAP_STYLE_URL,
      center,
      zoom: 11.5,
      attributionControl: false,
    });
    mapRef.current = map;
    mapReadyRef.current = false;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("error", (e) => {
      console.error("Mapbox error:", e.error);
      setMapError(lang === "pl" ? "Nie udało się załadować mapy." : "Failed to load map.");
    });

    const onRender = () => {
      if (!map.isSourceLoaded(SOURCE_ID)) return;
      updateMarkers();
    };

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geoJsonRef.current,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 52,
      });

      // Capsule markers are rendered as DOM elements on every render pass.
      map.on("render", onRender);
      map.on("moveend", updateMarkers);

      mapReadyRef.current = true;
      map.resize();
      updateMarkers();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      map.off("render", onRender);
      map.off("moveend", updateMarkers);
      popupRef.current?.remove();
      youMarkerRef.current?.remove();
      for (const id in markersRef.current) {
        const entry = markersRef.current[id];
        entry.marker.remove();
        const root = entry.root;
        setTimeout(() => root.unmount(), 0);
      }
      markersRef.current = {};
      markersOnScreenRef.current = {};
      map.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once per token
  }, [token, lang]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const apply = () => {
      const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
      if (source) source.setData(geoJsonRef.current);
      updateMarkers();
    };
    if (map.isStyleLoaded()) apply();
    else map.once("idle", apply);
  }, [geoJson, updateMarkers]);

  useEffect(() => {
    activePlaceIdRef.current = activePlaceId;
    for (const id in markersRef.current) {
      const entry = markersRef.current[id];
      if (entry.type !== "point" || !entry.placeId) continue;
      const place = placesByIdRef.current.get(entry.placeId);
      if (place) renderPointMarker(entry, place);
    }
  }, [activePlaceId, renderPointMarker]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    youMarkerRef.current?.remove();
    youMarkerRef.current = null;
    if (!myPosition) return;
    const youEl = document.createElement("div");
    youEl.style.cssText =
      "width:16px;height:16px;border-radius:50%;background:#F5B800;border:3px solid white;box-shadow:0 2px 12px rgba(245,184,0,.45)";
    youMarkerRef.current = new mapboxgl.Marker({ element: youEl })
      .setLngLat([myPosition.lng, myPosition.lat])
      .addTo(map);
  }, [myPosition]);

  if (!token) {
    return (
      <div className="map-root flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-ash-600">
          Ustaw <code className="text-honey-700">NEXT_PUBLIC_MAPBOX_TOKEN</code> w .env.local
        </p>
      </div>
    );
  }

  const categoryChips = (
    <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
      <Chip active={category === "all"} onClick={() => setCategory("all")} className="shrink-0">
        {m.all}
      </Chip>
      {PLACE_CATEGORIES.map((key) => {
        const meta = PLACE_CATEGORY_META[key];
        return (
          <Chip
            key={key}
            emoji={meta.icon}
            active={category === key}
            onClick={() => setCategory(key)}
            className="shrink-0"
          >
            {placeCategoryLabel(lang, key)}
          </Chip>
        );
      })}
    </div>
  );

  const advancedFilters = (
    <div className="mt-3 space-y-3 border-t border-ash-200/60 pt-3">
      <input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="w-full h-11 px-3 rounded-2xl bg-surface-2 border border-ash-200 text-body-sm text-ash-900 focus:outline-none focus:border-honey-500 focus:ring-2 focus:ring-honey-200"
        aria-label={m.date}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ash-600">
        <input
          type="checkbox"
          checked={onlyOpenSlots}
          onChange={(e) => setOnlyOpenSlots(e.target.checked)}
          className="accent-honey-500"
        />
        {m.onlyOpenSlotsHint}
      </label>
      <button
        type="button"
        onClick={requestMyLocation}
        className={cn(
          "w-full h-11 rounded-2xl border border-ash-200 bg-surface text-body-sm font-medium text-ash-900 shadow-xs hover:bg-ash-50 transition",
          locationEnabled && "border-honey-300 text-honey-700",
        )}
      >
        {m.useMyLocation}
      </button>
      {locationError ? <p className="text-xs text-danger">{locationError}</p> : null}
      <input
        type="range"
        min={1}
        max={10}
        value={radiusKm}
        disabled={!locationEnabled}
        onChange={(e) => setRadiusKm(Number(e.target.value))}
        className="h-2 w-full accent-honey-500 disabled:opacity-40"
        aria-label={m.radius}
      />
    </div>
  );

  const sectionLabels: Record<SlotBucket, string> = {
    now: lang === "pl" ? "Teraz" : "Now",
    today: lang === "pl" ? "Dziś" : "Today",
    week: lang === "pl" ? "W tym tygodniu" : "This week",
  };

  const renderSlotItem = (slot: MapSlot) => {
    const cat = CATEGORIES[toCategoryId(slot.category)];
    const dist = slotDistanceLabel(slot);
    const isActive = selectedSlotId === slot.id;
    return (
      <button
        key={slot.id}
        type="button"
        onClick={() => selectSlot(slot)}
        className={cn(
          "flex w-full items-start gap-3 rounded-2xl border border-transparent p-2.5 text-left transition hover:bg-ash-50",
          isActive && "border-ash-200/70 bg-ash-50 ring-2 ring-graphite/10",
        )}
      >
        <span
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{ backgroundColor: `${cat.color}1A` }}
          aria-hidden
        >
          {cat.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm font-semibold text-ash-900">
            {slot.title}
          </span>
          <span className="mt-0.5 block truncate text-caption text-ash-500">
            {slot.placeName}
            {dist ? ` · ${dist}` : ""} · {relativeStart(slot.dateTime, now, lang)}
          </span>
          <span className="mt-1.5 flex items-center justify-between gap-2">
            {slot.participantCount > 0 ? (
              <AvatarStack avatars={slot.participants} size="xs" max={3} />
            ) : (
              <span className="text-caption text-ash-400">
                {lang === "pl" ? "Brak zapisów" : "No one yet"}
              </span>
            )}
            <span className="shrink-0 font-mono text-body-sm font-semibold text-ash-700 tabular-nums">
              {formatStartTime(slot.dateTime, lang)}
            </span>
          </span>
        </span>
      </button>
    );
  };

  const slotGroups = (
    <div className="space-y-1">
      {(["now", "today", "week"] as SlotBucket[]).map((bucket) =>
        groupedSlots[bucket].length === 0 ? null : (
          <section key={bucket}>
            <h3 className="sticky top-0 z-10 bg-surface/95 px-2 py-1.5 text-caption font-semibold uppercase tracking-wider text-ash-500 backdrop-blur-sm">
              {sectionLabels[bucket]}
            </h3>
            <div className="space-y-0.5">{groupedSlots[bucket].map(renderSlotItem)}</div>
          </section>
        ),
      )}
      {totalSlots === 0 ? (
        <p className="px-2 py-8 text-center text-body-sm text-ash-500">
          {lang === "pl" ? "Brak slotów dla filtrów" : "No slots match"}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="map-root">
      <div ref={ref} className="map-canvas-inner" role="application" aria-label={m.title} />

      {mapError ? (
        <div className="pointer-events-none absolute inset-x-4 top-20 z-20 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-center text-sm text-danger">
          {mapError}
        </div>
      ) : null}

      {!mapError && filteredPlaces.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
          <div className="pointer-events-auto max-w-xs rounded-3xl border border-ash-200/60 bg-surface/95 px-6 py-5 text-center shadow-lg backdrop-blur-md">
            <p className="text-2xl" aria-hidden>🔍</p>
            <p className="mt-2 font-display text-heading-md text-ash-900">
              {lang === "pl" ? "Brak miejsc dla filtrów" : "No places match your filters"}
            </p>
            <p className="mt-1 text-body-sm text-ash-500">
              {lang === "pl"
                ? "Zmień kategorię, datę lub powiększ promień."
                : "Try another category, date, or a wider radius."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 lg:left-3 lg:max-w-sm lg:p-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-ash-200/60 bg-surface-2/95 px-3 py-2 shadow-sm backdrop-blur-md">
          <span className="text-ash-400" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={m.searchPlaceholder}
            className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ash-400 text-ash-900"
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-ash-600 hover:bg-ash-100 transition",
              filtersOpen && "bg-graphite text-surface",
            )}
          >
            {m.filters}
          </button>
        </div>

        <div className="pointer-events-auto rounded-2xl border border-ash-200/60 bg-surface-2/95 p-2 shadow-sm backdrop-blur-md">
          {categoryChips}
        </div>

        {filtersOpen ? (
          <div className="pointer-events-auto rounded-2xl border border-ash-200/60 bg-surface-2/95 p-3 shadow-sm backdrop-blur-md lg:block">
            {advancedFilters}
          </div>
        ) : null}
      </div>

      <aside className="pointer-events-none absolute bottom-4 left-4 top-auto z-10 hidden max-h-[min(460px,60%)] w-[min(380px,90%)] lg:pointer-events-auto lg:block">
        <div className="pointer-events-auto flex h-full max-h-[inherit] flex-col overflow-hidden rounded-3xl border border-ash-200/40 bg-surface shadow-md">
          <div className="border-b border-ash-200/60 px-4 py-3">
            <p className="font-display text-heading-md text-ash-900">
              {lang === "pl" ? "Najbliższe sloty" : "Upcoming slots"}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">{slotGroups}</div>
        </div>
      </aside>

      <div
        className="map-bottom-sheet pointer-events-auto lg:hidden"
        style={{ height: `${sheetHeight}dvh` }}
      >
        <div
          className="flex w-full cursor-grab touch-none flex-col items-center pt-2 pb-1 active:cursor-grabbing"
          onPointerDown={onSheetPointerDown}
          onPointerMove={onSheetPointerMove}
          onPointerUp={onSheetPointerUp}
          onPointerCancel={onSheetPointerUp}
          role="separator"
          aria-label={lang === "pl" ? "Przeciągnij, aby rozwinąć" : "Drag to expand"}
        >
          <span className="mb-2 h-1.5 w-10 rounded-full bg-ash-300" />
          <span className="px-4 font-display text-heading-md text-ash-900">
            {lang === "pl" ? "Najbliższe sloty" : "Upcoming slots"}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 pt-1">{slotGroups}</div>
      </div>

      {selectedSlot ? (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center px-4 lg:bottom-4 lg:left-[calc(min(380px,90%)+2.5rem)] lg:right-auto lg:top-auto lg:justify-start lg:px-0">
          <SlotPreviewCard
            slot={selectedSlot}
            now={now}
            lang={lang}
            distanceLabel={slotDistanceLabel(selectedSlot)}
            onClose={() => setSelectedSlotId(null)}
          />
        </div>
      ) : null}
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
