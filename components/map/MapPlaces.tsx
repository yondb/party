"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import type { GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation, MapPin, X } from "lucide-react";
import {
  PLACE_CATEGORIES,
  PLACE_CATEGORY_META,
  placeCategoryLabel,
  displayPlaceName,
  type PlaceCategory,
} from "@/lib/places";
import { mapUi } from "@/lib/i18n-ui";
import { Chip } from "@/components/ui/Chip";
import { MARKET_CENTER } from "@/lib/market";
import { cn } from "@/lib/utils";
import { MapMarker, MapClusterMarker } from "@/components/map/MapMarker";
import { SlotPreviewCard } from "@/components/map/SlotPreviewCard";
import { PlacePreviewCard } from "@/components/map/PlacePreviewCard";
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

function buildGeoJson(places: PlaceMapPin[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: places.map((p) => ({
      type: "Feature",
      id: p.id,
      properties: {
        placeId: p.id,
        category: p.category,
        activeSlotCount: p.activeSlotCount,
        color: PLACE_CATEGORY_META[p.category].color,
      },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  };
}

type NearbyMode = "closed" | "prompt" | "list";

export function MapPlaces({
  places,
  slots,
  initialQuery = "",
}: {
  places: PlaceMapPin[];
  slots: MapSlot[];
  initialQuery?: string;
}) {
  const m = mapUi();
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyMode, setNearbyMode] = useState<NearbyMode>("closed");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(58);
  const flewToUserRef = useRef(false);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [mapError, setMapError] = useState<string | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const requestMyLocationStable = useCallback((opts?: { fly?: boolean; onSuccess?: () => void }) => {
      if (!navigator.geolocation) {
        setLocationError(m.locationDenied);
        setLocationLoading(false);
        return;
      }
      setLocationError(null);
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition((pos) => {
          setMyPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationEnabled(true);
          setLocationLoading(false);
          const map = mapRef.current;
          if (map && opts?.fly !== false && !flewToUserRef.current) {
            flewToUserRef.current = true;
            map.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: 13,
              duration: 900,
            });
          }
          opts?.onSuccess?.();
        },
        () => {
          setLocationError(m.locationDenied);
          setLocationEnabled(false);
          setMyPosition(null);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
      );
    },
    [m.locationDenied],
  );

  const openNearby = useCallback(() => {
    if (locationEnabled && myPosition) {
      setNearbyMode("list");
      setSheetHeight(58);
    } else {
      setNearbyMode("prompt");
    }
  }, [locationEnabled, myPosition]);

  const closeNearby = useCallback(() => {
    setNearbyMode("closed");
    setLocationError(null);
  }, []);

  const allowNearbyLocation = useCallback(() => {
    requestMyLocationStable({
      fly: true,
      onSuccess: () => {
        setNearbyMode("list");
        setSheetHeight(58);
      },
    });
  }, [requestMyLocationStable]);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return places.filter((place) => {
      if (category !== "all" && place.category !== category) return false;
      if (q) {
        const name = displayPlaceName(place).toLowerCase();
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
  }, [places, category, searchQuery, dateFilter, onlyOpenSlots, locationEnabled, myPosition, radiusKm]);

  const geoJson = useMemo(() => buildGeoJson(filteredPlaces), [filteredPlaces]);
  const geoJsonRef = useRef(geoJson);
  geoJsonRef.current = geoJson;

  useEffect(() => {
    placesByIdRef.current = new Map(filteredPlaces.map((p) => [p.id, p]));
  }, [filteredPlaces]);

  const slotDistanceLabel = useCallback((slot: MapSlot): string | null => {
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

  const selectedSlot = useMemo(() => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId],
  );

  const activePlace = useMemo(() => filteredPlaces.find((p) => p.id === activePlaceId) ?? null,
    [filteredPlaces, activePlaceId],
  );

  const placeDistanceLabel = useCallback((place: PlaceMapPin): string | null => {
      if (!locationEnabled || !myPosition) return null;
      const km = distanceKm(myPosition.lat, myPosition.lng, place.lat, place.lng);
      return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
    },
    [locationEnabled, myPosition],
  );

  const nearbyPlaces = useMemo(() => {
    if (!locationEnabled || !myPosition) {
      return [...filteredPlaces]
        .sort((a, b) =>
          displayPlaceName(a).localeCompare(displayPlaceName(b), "en"),
        )
        .slice(0, 20);
    }
    return [...filteredPlaces]
      .map((p) => ({
        place: p,
        km: distanceKm(myPosition.lat, myPosition.lng, p.lat, p.lng),
      }))
      .filter(({ km }) => km <= radiusKm)
      .sort((a, b) => a.km - b.km)
      .slice(0, 20)
      .map(({ place }) => place);
  }, [filteredPlaces, locationEnabled, myPosition, radiusKm]);

  const flyToPlace = useCallback((place: PlaceMapPin) => {
    const map = mapRef.current;
    setSelectedSlotId(null);
    setActivePlaceId(place.id);
    if (map) {
      map.flyTo({ center: [place.lng, place.lat], zoom: 15, duration: 900 });
    }
  }, []);

  useEffect(() => {
    flyToPlaceRef.current = flyToPlace;
  }, [flyToPlace]);

  const selectSlot = useCallback((slot: MapSlot) => {
    setSelectedSlotId(slot.id);
    setActivePlaceId(slot.placeId);
    const map = mapRef.current;
    if (map) {
      map.flyTo({ center: [slot.lng, slot.lat], zoom: 15, duration: 900 });
    }
  }, []);

  const dragRef = useRef<{ startY: number; startH: number } | null>(null);
  const onSheetPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { startY: e.clientY, startH: sheetHeight };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const stopSheetDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
  };
  const onSheetPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.clientY;
    const vh = (dy / window.innerHeight) * 100;
    setSheetHeight(Math.min(75, Math.max(38, dragRef.current.startH + vh)));
  };
  const onSheetPointerUp = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setSheetHeight((h) => (h > 48 ? 68 : h > 32 ? 58 : 38));
  };

  const nearbyOpen = nearbyMode !== "closed";
  const filtersActive =
    category !== "all" || dateFilter !== "" || onlyOpenSlots || locationEnabled;

  const renderPointMarker = useCallback((entry: MarkerEntry, place: PlaceMapPin) => {
    entry.root.render(<MapMarker
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
    const queried = map.querySourceFeatures(SOURCE_ID);
    const features =
      queried.length > 0
        ? queried
        : Array.from(placesByIdRef.current.values()).map((place) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [place.lng, place.lat] as [number, number],
            },
            properties: { placeId: place.id, cluster: false },
          }));

    for (const feature of features) {
      if (feature.geometry.type !== "Point") continue;
      const props = (feature.properties ?? {}) as Record<string, unknown>;
      const isCluster = Boolean(props.cluster);
      const placeId = props.placeId as string | undefined;
      const id = isCluster ? `cluster-${props.cluster_id}` : `pt-${placeId ?? props.id}`;
      if (newMarkers[id]) continue;

      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      let entry = markersRef.current[id];

      if (!entry) {
        const el = document.createElement("div");
        const root = createRoot(el);
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" }).setLngLat(coords);
        entry = { marker, root, type: isCluster ? "cluster" : "point" };
        markersRef.current[id] = entry;

        if (isCluster) {
          const clusterId = props.cluster_id as number;
          const count = props.point_count as number;
          root.render(<MapClusterMarker
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
          const pid = placeId ?? (props.id as string | undefined);
          const place = pid ? placesByIdRef.current.get(pid) : undefined;
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
        : MARKET_CENTER;

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
      setMapError("Failed to load map.");
    });

    const onRender = () => {
      if (!map.isSourceLoaded(SOURCE_ID)) return;
      updateMarkers();
    };

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geoJsonRef.current,
        promoteId: "placeId",
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 52,
      });

      // Invisible layers so querySourceFeatures returns cluster/point features.
      map.addLayer({
        id: "places-clusters",
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-opacity": 0,
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 50, 28],
        },
      });
      map.addLayer({
        id: "places-point",
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-opacity": 0, "circle-radius": 8 },
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
  }, [token]);

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
    return (<div className="map-root flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-ash-600">
          Set <code className="text-honey-700">NEXT_PUBLIC_MAPBOX_TOKEN</code> in .env.local
        </p>
      </div>
    );
  }

  const categoryChips = (<div className="flex flex-wrap gap-1.5 lg:gap-2">
      <Chip active={category === "all"} onClick={() => setCategory("all")} className="shrink-0 h-8 px-2.5 text-xs lg:h-9 lg:px-3.5 lg:text-body-sm">
        {m.all}
      </Chip>
      {PLACE_CATEGORIES.map((key) => {
        const meta = PLACE_CATEGORY_META[key];
        const count = places.filter((p) => p.category === key).length;
        return (<Chip
            key={key}
            emoji={meta.icon}
            active={category === key}
            onClick={() => setCategory(key)}
            className="shrink-0 h-8 px-2.5 text-xs lg:h-9 lg:px-3.5 lg:text-body-sm"
          >
            {placeCategoryLabel(key)}
            <span className="ml-1 font-mono text-[10px] opacity-60">{count}</span>
          </Chip>
        );
      })}
    </div>
  );

  const advancedFilters = (<div className="mt-3 space-y-3 border-t border-ash-200/60 pt-3">
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
        onClick={() => requestMyLocationStable({ fly: true })}
        className={cn("w-full h-11 rounded-2xl border border-ash-200 bg-surface text-body-sm font-medium text-ash-900 shadow-xs hover:bg-ash-50 transition",
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
    now: "Now",
    today: "Today",
    week: "This week",
  };

  const renderSlotItem = (slot: MapSlot) => {
    const cat = CATEGORIES[toCategoryId(slot.category)];
    const dist = slotDistanceLabel(slot);
    const isActive = selectedSlotId === slot.id;
    return (<button
        key={slot.id}
        type="button"
        onClick={() => selectSlot(slot)}
        className={cn("flex w-full items-start gap-3 rounded-2xl border border-transparent p-2.5 text-left transition hover:bg-ash-50",
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
            {dist ? ` · ${dist}` : ""} · {relativeStart(slot.dateTime, now)}
          </span>
          <span className="mt-1.5 flex items-center justify-between gap-2">
            {slot.participantCount > 0 ? (<AvatarStack avatars={slot.participants} size="xs" max={3} />
            ) : (<span className="text-caption text-ash-400">
                {"No one yet"}
              </span>
            )}
            <span className="shrink-0 font-mono text-body-sm font-semibold text-ash-700 tabular-nums">
              {formatStartTime(slot.dateTime)}
            </span>
          </span>
        </span>
      </button>
    );
  };

  const slotGroups = (<div className="space-y-1">
      {(["now", "today", "week"] as SlotBucket[]).map((bucket) =>
        groupedSlots[bucket].length === 0 ? null : (<section key={bucket}>
            <h3 className="sticky top-0 z-10 bg-surface/95 px-2 py-1.5 text-caption font-semibold uppercase tracking-wider text-ash-500 backdrop-blur-sm">
              {sectionLabels[bucket]}
            </h3>
            <div className="space-y-0.5">{groupedSlots[bucket].map(renderSlotItem)}</div>
          </section>
        ),
      )}
      {totalSlots === 0 ? (<p className="px-2 py-8 text-center text-body-sm text-ash-500">
          {"No slots match"}
        </p>
      ) : null}
    </div>
  );

  const renderPlaceItem = (place: PlaceMapPin) => {
    const cat = CATEGORIES[toCategoryId(place.category)];
    const dist = placeDistanceLabel(place);
    const isActive = activePlaceId === place.id;
    const displayName = displayPlaceName(place);
    return (<button
        key={place.id}
        type="button"
        onClick={() => flyToPlace(place)}
        className={cn("flex w-full items-start gap-3 rounded-2xl border border-transparent p-2.5 text-left transition hover:bg-ash-50",
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
          <span className="block truncate text-body-sm font-semibold text-ash-900">{displayName}</span>
          <span className="mt-0.5 block truncate text-caption text-ash-500">
            {placeCategoryLabel(place.category)}
            {place.district ? ` · ${place.district}` : ""}
            {dist ? ` · ${dist}` : ""}
          </span>
          {place.activeSlotCount > 0 ? (<span className="mt-1 inline-block rounded-full bg-honey-100 px-2 py-0.5 text-caption font-medium text-honey-800">
              {place.activeSlotCount} slots
            </span>
          ) : (<span className="mt-1 block text-caption text-ash-400">
              {"No slots — create the first"}
            </span>
          )}
        </span>
      </button>
    );
  };

  const placeList = (<div className="space-y-0.5">
      {nearbyPlaces.map(renderPlaceItem)}
      {nearbyPlaces.length === 0 ? (<p className="px-2 py-8 text-center text-body-sm text-ash-500">
          {locationEnabled && myPosition
            ? m.nearbyEmpty(radiusKm)
            : "No places match"}
        </p>
      ) : null}
    </div>
  );

  const listTitle = totalSlots > 0 ? m.nearbySlotsTitle : m.nearbyTitle;
  const listContent = totalSlots > 0 ? slotGroups : placeList;

  return (<div className="map-root">
      <div ref={ref} className="map-canvas-inner" role="application" aria-label={m.title} />

      {mapError ? (<div className="pointer-events-none absolute inset-x-4 top-20 z-20 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-center text-sm text-danger">
          {mapError}
        </div>
      ) : null}

      {!mapError && filteredPlaces.length === 0 ? (<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
          <div className="pointer-events-auto max-w-xs rounded-3xl border border-ash-200/60 bg-surface/95 px-6 py-5 text-center shadow-lg backdrop-blur-md">
            <p className="text-2xl" aria-hidden>🔍</p>
            <p className="mt-2 font-display text-heading-md text-ash-900">
              {"No places match your filters"}
            </p>
            <p className="mt-1 text-body-sm text-ash-500">
              {"Try another category, date, or a wider radius."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-1.5 p-2 lg:left-3 lg:max-w-sm lg:gap-2 lg:p-4">
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
            className={cn("relative shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-ash-600 hover:bg-ash-100 transition lg:text-body-sm",
              filtersOpen && "bg-graphite text-surface",
            )}
          >
            {m.filters}
            {filtersActive && !filtersOpen ? (<span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-honey-500" aria-hidden />
            ) : null}
          </button>
        </div>

        {/* Desktop: category chips always visible */}
        <div className="pointer-events-auto hidden rounded-2xl border border-ash-200/60 bg-surface-2/95 p-2 shadow-sm backdrop-blur-md lg:block">
          {categoryChips}
        </div>

        {filtersOpen ? (<div className="pointer-events-auto rounded-2xl border border-ash-200/60 bg-surface-2/95 p-3 shadow-sm backdrop-blur-md max-h-[min(50vh,360px)] overflow-y-auto">
            <div className="mb-3 lg:hidden">{categoryChips}</div>
            {advancedFilters}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => {
          if (locationEnabled && myPosition) {
            requestMyLocationStable({ fly: true });
          } else {
            openNearby();
          }
        }}
        className="pointer-events-auto absolute right-3 z-20 flex size-11 items-center justify-center rounded-full border border-ash-200/70 bg-surface text-graphite shadow-md transition hover:bg-ash-50 active:scale-95 lg:right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-8"
        aria-label={m.useMyLocation}
      >
        <Navigation
          className={cn("size-5", locationEnabled && "text-honey-600")}
          strokeWidth={2.25}
        />
      </button>

      {nearbyMode === "closed" ? (<button
          type="button"
          onClick={openNearby}
          className="pointer-events-auto absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-ash-200/70 bg-surface px-5 py-3 text-body-sm font-semibold text-ash-900 shadow-lg transition hover:bg-ash-50 active:scale-[0.98] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-8"
        >
          <MapPin className="size-4 text-honey-600" strokeWidth={2.25} />
          {m.nearbyFab}
        </button>
      ) : null}

      {nearbyOpen ? (<>
          <button
            type="button"
            aria-label="Close"
            className="pointer-events-auto absolute inset-0 z-[35] bg-graphite/30 backdrop-blur-[2px]"
            onClick={closeNearby}
          />
          <div
            className="map-bottom-sheet pointer-events-auto z-[40]"
            style={{
              height: nearbyMode === "prompt" ? "auto" : `${sheetHeight}dvh`,
              maxHeight: nearbyMode === "prompt" ? "none" : "75dvh",
            }}
          >
            {nearbyMode === "prompt" ? (<div className="flex flex-col p-5 pb-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-honey-100 text-2xl">
                    📍
                  </div>
                  <button
                    type="button"
                    onClick={closeNearby}
                    onPointerDown={stopSheetDrag}
                    className="rounded-full p-1.5 text-ash-400 hover:bg-ash-100 hover:text-ash-700"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <h2 className="mt-4 font-display text-heading-md text-ash-900">{m.nearbyPromptTitle}</h2>
                <p className="mt-2 text-body-sm leading-relaxed text-ash-500">{m.nearbyPromptBody}</p>
                {locationError ? (<p className="mt-3 text-sm text-danger">{locationError}</p>
                ) : null}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={locationLoading}
                    onClick={allowNearbyLocation}
                    className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-graphite text-body-sm font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
                  >
                    {locationLoading ? m.nearbyLoading : m.nearbyAllow}
                  </button>
                  <button
                    type="button"
                    disabled={locationLoading}
                    onClick={closeNearby}
                    className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-ash-200 bg-surface text-body-sm font-medium text-ash-700 transition hover:bg-ash-50"
                  >
                    {m.nearbyNotNow}
                  </button>
                </div>
              </div>
            ) : (<>
                <div className="flex w-full items-start justify-between gap-2 px-4 pt-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-heading-md text-ash-900">{listTitle}</p>
                    <p className="mt-0.5 text-caption text-ash-500">
                      {locationEnabled && myPosition
                        ? m.nearbyWithin(radiusKm)
                        : m.nearbyTapHint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeNearby}
                    onPointerDown={stopSheetDrag}
                    className="shrink-0 rounded-full p-1.5 text-ash-400 hover:bg-ash-100 hover:text-ash-700"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div
                  className="flex w-full cursor-grab touch-none flex-col items-center pt-2 pb-1 active:cursor-grabbing lg:hidden"
                  onPointerDown={onSheetPointerDown}
                  onPointerMove={onSheetPointerMove}
                  onPointerUp={onSheetPointerUp}
                  onPointerCancel={onSheetPointerUp}
                  role="separator"
                  aria-label="Drag to resize"
                >
                  <span className="mb-1 h-1.5 w-10 rounded-full bg-ash-300" />
                </div>
                {locationEnabled ? (<div className="mt-2 w-full px-4">
                    <input
                      type="range"
                      min={1}
                      max={25}
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="h-2 w-full accent-honey-500"
                      aria-label={m.radius}
                    />
                    <p className="mt-1 text-center text-caption text-ash-400">
                      {m.nearbyCount(nearbyPlaces.length)} · {radiusKm} {m.km}
                    </p>
                  </div>
                ) : null}
                <div className="flex-1 overflow-y-auto px-2 pb-4 pt-1">{listContent}</div>
              </>
            )}
          </div>
        </>
      ) : null}

      {selectedSlot ? (<div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center px-4 lg:top-auto lg:bottom-[calc(22rem+env(safe-area-inset-bottom,0px))] lg:justify-start lg:px-6">
          <SlotPreviewCard
            slot={selectedSlot}
            now={now}
            distanceLabel={slotDistanceLabel(selectedSlot)}
            onClose={() => setSelectedSlotId(null)}
          />
        </div>
      ) : activePlace ? (<div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center px-4 lg:top-auto lg:bottom-[calc(22rem+env(safe-area-inset-bottom,0px))] lg:justify-start lg:px-6">
          <PlacePreviewCard
            place={activePlace}
            onClose={() => setActivePlaceId(null)}
          />
        </div>
      ) : null}
    </div>
  );
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
