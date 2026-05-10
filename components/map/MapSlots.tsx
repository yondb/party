"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ACTIVITY_KEYS, type ActivityKey } from "@/lib/activities";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { activityLabel, ICON_ANY, ICON_FEMALE, ICON_MALE, mapUi } from "@/lib/i18n-ui";

export type MapPin = {
  id: string;
  title: string;
  lng: number;
  lat: number;
  activity_type: string;
  date_time: string;
  host_gender: "female" | "male" | null;
  gender_scope: "any" | "female" | "male";
};

const controlFocus =
  "outline-none transition focus-visible:border-[var(--gold-mid)] focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]";

export function MapSlots({ pins }: { pins: MapPin[] }) {
  const { lang } = useLanguage();
  const m = mapUi(lang);
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radiusKm, setRadiusKm] = useState(10);
  const [activity, setActivity] = useState<"all" | ActivityKey>("all");
  const [hostGender, setHostGender] = useState<"all" | "female" | "male">("all");
  const [audience, setAudience] = useState<"all" | "any" | "female" | "male">("all");
  const [dateFilter, setDateFilter] = useState("");
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setMyPosition(null);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 },
    );
  }, []);

  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      if (activity !== "all" && pin.activity_type !== activity) {
        return false;
      }
      if (hostGender !== "all" && pin.host_gender !== hostGender) {
        return false;
      }
      if (audience !== "all") {
        const scope = pin.gender_scope ?? "any";
        if (audience === "any" && scope !== "any") return false;
        if (audience === "female" && scope !== "female") return false;
        if (audience === "male" && scope !== "male") return false;
      }
      if (dateFilter) {
        const eventDate = new Date(pin.date_time);
        const ymd = eventDate.toISOString().slice(0, 10);
        if (ymd !== dateFilter) return false;
      }
      if (myPosition) {
        const km = distanceKm(myPosition.lat, myPosition.lng, pin.lat, pin.lng);
        if (km > radiusKm) return false;
      }
      return true;
    });
  }, [pins, activity, hostGender, audience, dateFilter, myPosition, radiusKm]);

  useEffect(() => {
    if (!token || !ref.current) return;
    mapboxgl.accessToken = token;
    const center = myPosition
      ? [myPosition.lng, myPosition.lat]
      : filteredPins[0]
        ? [filteredPins[0].lng, filteredPins[0].lat]
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

    for (const p of filteredPins) {
      new mapboxgl.Marker({ color: "#c9963a" })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(`<strong>${p.title}</strong>`))
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, filteredPins, myPosition, lang]);

  if (!token) {
    return (
      <div className="wow-card rounded-lg p-6 text-center text-sm text-[var(--text-muted)]">
        Set <code className="text-[var(--gold-mid)]">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
        <code>.env.local</code> (dev) or in{" "}
        <span className="text-[var(--gold-mid)]">Vercel → Project → Settings → Environment Variables</span>{" "}
        (production), then redeploy. Pins in DB: {pins.length}.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-[var(--gold-dim)] bg-[var(--bg-card)] p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-5">
        <label className="text-sm font-medium leading-snug text-[var(--text-secondary)]">
          {m.activity}
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as "all" | ActivityKey)}
            className={`input-wow mt-1 ${controlFocus}`}
          >
            <option value="all">{m.all}</option>
            {ACTIVITY_KEYS.map((key) => (
              <option key={key} value={key}>
                {activityLabel(lang, key)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium leading-snug text-[var(--text-secondary)]">
          {m.hostGender}
          <select
            value={hostGender}
            onChange={(e) => setHostGender(e.target.value as "all" | "female" | "male")}
            className={`input-wow mt-1 font-mono text-base ${controlFocus}`}
          >
            <option value="all">{ICON_ANY}</option>
            <option value="female">{ICON_FEMALE}</option>
            <option value="male">{ICON_MALE}</option>
          </select>
        </label>

        <label className="text-sm font-medium leading-snug text-[var(--text-secondary)]">
          {m.audience}
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as "all" | "any" | "female" | "male")}
            className={`input-wow mt-1 text-sm ${controlFocus}`}
          >
            <option value="all">{m.audienceAll}</option>
            <option value="any">{m.audienceOpen}</option>
            <option value="female">{m.audienceWomen}</option>
            <option value="male">{m.audienceMen}</option>
          </select>
        </label>

        <label className="text-sm font-medium leading-snug text-[var(--text-secondary)]">
          {m.date}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`input-wow mt-1 ${controlFocus}`}
          />
        </label>

        <label className="text-sm font-medium leading-snug text-[var(--text-secondary)]">
          {m.radius} ({radiusKm} {m.km})
          <input
            type="range"
            min={1}
            max={10}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className={`mt-2 w-full accent-[var(--gold-mid)] ${controlFocus} rounded-full`}
          />
        </label>
      </div>

      <div
        ref={ref}
        tabIndex={0}
        role="application"
        aria-label={m.title}
        className="h-[min(70dvh,32rem)] w-full overflow-hidden rounded-lg border border-[var(--gold-dim)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] md:h-[min(68dvh,40rem)] xl:h-[min(65dvh,44rem)]"
      />
      <p className="text-sm text-[var(--text-muted)]">
        {m.results}: {filteredPins.length}
        {myPosition ? ` — ${m.within} ${radiusKm} ${m.km}` : ""}
      </p>
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
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
