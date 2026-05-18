"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  PLACE_CATEGORIES,
  PLACE_CATEGORY_META,
  placeCategoryLabel,
  type PlaceCategory,
} from "@/lib/places";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { mapUi } from "@/lib/i18n-ui";

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

const controlFocus =
  "outline-none transition focus-visible:border-[var(--gold-mid)] focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]";

const filterLabelClass =
  "font-display text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--text-muted)]";

/** Same vertical rhythm for every filter — fixes misaligned selects vs range in multi-column grids. */
function MapFilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-2">
      <span className={filterLabelClass}>{label}</span>
      <div className="flex min-h-[2.75rem] flex-col justify-center">{children}</div>
    </div>
  );
}

export function MapPlaces({ places }: { places: PlaceMapPin[] }) {
  const { lang } = useLanguage();
  const m = mapUi(lang);
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radiusKm, setRadiusKm] = useState(10);
  const [category, setCategory] = useState<"all" | PlaceCategory>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [onlyOpenSlots, setOnlyOpenSlots] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
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
    return places.filter((place) => {
      if (category !== "all" && place.category !== category) return false;
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
  }, [places, category, dateFilter, onlyOpenSlots, locationEnabled, myPosition, radiusKm]);

  useEffect(() => {
    if (!token || !ref.current) return;
    mapboxgl.accessToken = token;
    const center = myPosition
      ? [myPosition.lng, myPosition.lat]
      : filteredPlaces[0]
        ? [filteredPlaces[0].lng, filteredPlaces[0].lat]
        : [21.0122, 52.2297];
    const map = new mapboxgl.Map({
      container: ref.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: center as [number, number],
      zoom: 11,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const youHere = mapUi(lang).youHere;
    if (myPosition) {
      new mapboxgl.Marker({ color: "#6aa8ff" })
        .setLngLat([myPosition.lng, myPosition.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(`<strong>${youHere}</strong>`))
        .addTo(map);
    }

    const locale = lang === "pl" ? "pl-PL" : "en-US";
    for (const p of filteredPlaces) {
      const meta = PLACE_CATEGORY_META[p.category];
      const catLabel = placeCategoryLabel(lang, p.category);
      const districtLine = p.district ? ` · ${escapeHtml(p.district)}` : "";
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
                return `<a class="lfparty-map-popup__slot-line" href="/slots/${escapeHtml(s.id)}">${escapeHtml(when)} · ${occupied}/${total} ${escapeHtml(m.popupSpots)}</a>`;
              })
              .join("");
      const badge =
        p.activeSlotCount > 0
          ? ` <span class="lfparty-map-popup__badge">${p.activeSlotCount} ${escapeHtml(m.popupSlotsBadge)}</span>`
          : "";
      const html = `
        <div class="lfparty-map-popup">
          <p class="lfparty-map-popup__title">${meta.icon} ${escapeHtml(p.name)}${badge}</p>
          <p class="lfparty-map-popup__meta">${escapeHtml(catLabel)}${districtLine}</p>
          <p class="lfparty-map-popup__section">${escapeHtml(m.popupUpcoming)}</p>
          ${slotsHtml}
          <div class="lfparty-map-popup__actions">
            <a class="lfparty-map-popup__link" href="/slots/new?place_id=${p.id}">${escapeHtml(m.popupCreateSlot)}</a>
            <a class="lfparty-map-popup__link lfparty-map-popup__link--muted" href="/places/${p.id}">${escapeHtml(m.popupViewAll)}</a>
          </div>
        </div>`;
      new mapboxgl.Marker({ color: meta.color })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16, className: "lfparty-map-popup-wrap" }).setHTML(html))
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, filteredPlaces, myPosition, lang, m]);

  if (!token) {
    return (
      <div className="wow-card rounded-lg p-6 text-center text-sm text-[var(--text-muted)]">
        Set <code className="text-[var(--gold-mid)]">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
        <code>.env.local</code> (dev) or in{" "}
        <span className="text-[var(--gold-mid)]">Vercel → Project → Settings → Environment Variables</span>{" "}
        (production), then redeploy. Places in DB: {places.length}.
      </div>
    );
  }

  const radiusCaption = `${m.radius} · ${radiusKm} ${m.km}`;

  return (
    <div className="space-y-3">
      <section
        className="rounded-lg border border-[var(--gold-dim)] bg-[var(--bg-card)] p-4 shadow-[inset_0_1px_0_rgba(240,192,64,0.04)] sm:p-5"
        aria-label={lang === "pl" ? "Filtry mapy" : "Map filters"}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <MapFilterField label={m.placeCategory}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "all" | PlaceCategory)}
              className={`input-wow ${controlFocus}`}
            >
              <option value="all">{m.all}</option>
              {PLACE_CATEGORIES.map((key) => (
                <option key={key} value={key}>
                  {placeCategoryLabel(lang, key)}
                </option>
              ))}
            </select>
          </MapFilterField>

          <MapFilterField label={m.date}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`input-wow ${controlFocus}`}
            />
          </MapFilterField>

          <MapFilterField label={m.onlyOpenSlots}>
            <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={onlyOpenSlots}
                onChange={(e) => setOnlyOpenSlots(e.target.checked)}
                className="accent-[var(--gold-mid)]"
              />
              {m.onlyOpenSlotsHint}
            </label>
          </MapFilterField>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[var(--gold-dim)]/60 pt-4 sm:grid-cols-2 sm:gap-5 lg:mt-5 lg:pt-5">

          <MapFilterField label={radiusCaption}>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={requestMyLocation}
                className={`min-h-[2.75rem] rounded-lg border px-3 text-sm font-semibold transition ${controlFocus} ${
                  locationEnabled
                    ? "border-[var(--gold-bright)] bg-[var(--bg-panel)] text-[var(--gold-bright)]"
                    : "border-[var(--gold-dim)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--gold-dark)]"
                }`}
              >
                {m.useMyLocation}
              </button>
              {locationError ? (
                <p className="text-xs text-[var(--status-full)]">{locationError}</p>
              ) : null}
              <input
                type="range"
                min={1}
                max={10}
                value={radiusKm}
                disabled={!locationEnabled}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={radiusKm}
                aria-label={radiusCaption}
                className={`h-2.5 w-full cursor-pointer accent-[var(--gold-mid)] ${controlFocus} rounded-full bg-[var(--bg-input)] disabled:opacity-40`}
              />
            </div>
          </MapFilterField>
        </div>
      </section>

      <div
        ref={ref}
        tabIndex={0}
        role="application"
        aria-label={m.title}
        className="h-[min(72dvh,36rem)] w-full overflow-hidden rounded-lg border border-[var(--gold-dim)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] md:h-[min(70dvh,520px)] lg:h-[min(75dvh,600px)] xl:h-[min(78dvh,680px)]"
      />
      <p className="mb-8 mt-2 font-display text-lg font-semibold text-[var(--text-bright)]">
        {m.resultsFound(filteredPlaces.length)}
        {locationEnabled && myPosition ? (
          <span className="mt-1 block text-sm font-normal text-[var(--text-muted)]">
            {m.within} {radiusKm} {m.km}
          </span>
        ) : null}
      </p>
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
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
