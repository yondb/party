"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const CLUSTER_LAYER = "clusters";
const CLUSTER_COUNT_LAYER = "cluster-count";
const POINT_LAYER = "unclustered-point";

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
        <a class="lfparty-map-popup__link" href="/slots/new?place_id=${p.id}">${escapeHtml(m.popupCreateSlot)}</a>
        <a class="lfparty-map-popup__link lfparty-map-popup__link--muted" href="/places/${p.id}">${escapeHtml(m.popupViewAll)}</a>
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

export function MapPlaces({ places }: { places: PlaceMapPin[] }) {
  const { lang } = useLanguage();
  const m = mapUi(lang);
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const youMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const placesByIdRef = useRef<Map<string, PlaceMapPin>>(new Map());
  const mapReadyRef = useRef(false);
  const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [category, setCategory] = useState<"all" | PlaceCategory>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [onlyOpenSlots, setOnlyOpenSlots] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
      setSheetExpanded(true);
    },
    [openPlacePopup],
  );

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
      style: "mapbox://styles/mapbox/light-v11",
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

    const onClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] });
      const clusterId = features[0]?.properties?.cluster_id;
      if (clusterId == null) return;
      const source = map.getSource(SOURCE_ID) as GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return;
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom });
      });
    };

    const onPointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      const feature = e.features?.[0];
      const id = feature?.properties?.id as string | undefined;
      if (!id) return;
      const place = placesByIdRef.current.get(id);
      if (!place) return;
      flyToPlace(place);
    };

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geoJsonRef.current,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 52,
      });

      map.addLayer({
        id: CLUSTER_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#18181B",
          "circle-radius": ["step", ["get", "point_count"], 18, 8, 24, 20, 30],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 13,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: POINT_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "case",
            ["==", ["get", "id"], activePlaceId ?? ""],
            14,
            11,
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", CLUSTER_LAYER, onClusterClick);
      map.on("click", POINT_LAYER, onPointClick);
      map.on("mouseenter", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", POINT_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", POINT_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });

      mapReadyRef.current = true;
      map.resize();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      popupRef.current?.remove();
      youMarkerRef.current?.remove();
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
    };
    if (map.isStyleLoaded()) apply();
    else map.once("idle", apply);
  }, [geoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer(POINT_LAYER)) return;
    map.setPaintProperty(POINT_LAYER, "circle-radius", [
      "case",
      ["==", ["get", "id"], activePlaceId ?? ""],
      14,
      11,
    ]);
  }, [activePlaceId]);

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

  const placeListItems = filteredPlaces.map((place) => {
    const meta = PLACE_CATEGORY_META[place.category];
    const catLabel = placeCategoryLabel(lang, place.category);
    return (
      <button
        key={place.id}
        type="button"
        onClick={() => flyToPlace(place)}
        className={cn(
          "mb-2 flex w-full items-center gap-3 rounded-3xl border border-ash-200/40 bg-surface p-3 text-left shadow-sm transition hover:shadow-md hover:-translate-y-0.5",
          activePlaceId === place.id && "ring-2 ring-honey-500 ring-offset-2",
        )}
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{ background: `${meta.color}18` }}
        >
          {meta.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ash-900">
            {displayPlaceName(place, lang)}
          </span>
          <span className="block text-xs text-ash-500">
            {catLabel}
            {place.district ? ` · ${place.district}` : ""}
          </span>
        </span>
        {place.activeSlotCount > 0 ? (
          <span className="shrink-0 rounded-full bg-graphite px-2 py-0.5 text-xs font-semibold text-surface">
            {place.activeSlotCount}
          </span>
        ) : null}
      </button>
    );
  });

  return (
    <div className="map-root">
      <div ref={ref} className="map-canvas-inner" role="application" aria-label={m.title} />

      {mapError ? (
        <div className="pointer-events-none absolute inset-x-4 top-20 z-20 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-center text-sm text-danger">
          {mapError}
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

      <div className="pointer-events-none absolute bottom-4 left-4 top-auto z-10 hidden max-h-[min(420px,55%)] w-[min(380px,90%)] lg:pointer-events-auto lg:block">
        <div className="pointer-events-auto flex h-full max-h-[inherit] flex-col overflow-hidden rounded-3xl border border-ash-200/40 bg-surface shadow-md">
          <div className="border-b border-ash-200/60 px-4 py-3">
            <p className="text-sm font-semibold text-ash-900">{m.listTitle}</p>
            <p className="text-xs text-ash-500">{m.resultsFound(filteredPlaces.length)}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredPlaces.length === 0 ? (
              <p className="p-4 text-center text-sm text-ash-500">
                {lang === "pl" ? "Brak miejsc" : "No places"}
              </p>
            ) : (
              placeListItems
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "map-bottom-sheet pointer-events-auto lg:hidden",
          sheetExpanded ? "max-h-[58dvh]" : "max-h-[38dvh]",
        )}
      >
        <button
          type="button"
          className="flex w-full flex-col items-center pt-2 pb-1"
          onClick={() => setSheetExpanded((e) => !e)}
          aria-expanded={sheetExpanded}
        >
          <span className="mb-2 h-1 w-10 rounded-full bg-ash-300" />
          <span className="px-4 text-sm font-semibold text-ash-900">
            {m.listTitle} · {m.resultsFound(filteredPlaces.length)}
          </span>
        </button>
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-1">
          {filteredPlaces.length === 0 ? (
            <p className="py-6 text-center text-sm text-ash-500">
              {lang === "pl" ? "Brak miejsc dla filtrów" : "No places match"}
            </p>
          ) : (
            placeListItems
          )}
        </div>
      </div>
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
