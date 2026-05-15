import type { Lang } from "@/lib/i18n-lang";

/** Matches `SlotForm` merged description prefix for `other` activity. */
export function splitCustomActivityDescription(
  desc: string | null,
  lang: Lang,
): { other: string; body: string } {
  if (!desc) return { other: "", body: "" };
  const prefix = lang === "pl" ? "Niestandardowa aktywność: " : "Custom activity: ";
  if (!desc.startsWith(prefix)) return { other: "", body: desc };
  const rest = desc.slice(prefix.length);
  const idx = rest.indexOf("\n\n");
  if (idx === -1) return { other: rest.trim(), body: "" };
  return { other: rest.slice(0, idx).trim(), body: rest.slice(idx + 2).trim() };
}

/** Value for `<input type="datetime-local" />` in local timezone. */
export function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
