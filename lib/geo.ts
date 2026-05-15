import type { Lang } from "@/lib/i18n-lang";

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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

export function formatDistanceKm(km: number, lang: Lang): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return lang === "pl" ? `${m} m` : `${m} m`;
  }
  return lang === "pl" ? `${km.toFixed(1)} km` : `${km.toFixed(1)} km`;
}

/** `yyyy-mm-dd` → e.g. "Thu, May 7" */
export function formatFilterDate(ymd: string, lang: Lang): string {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  const locale = lang === "pl" ? "pl-PL" : "en-US";
  return d.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
}
