import { getSiteUrl } from "@/lib/site";

export function buildSlotShareUrl(slotId: string, source = "share"): string {
  const base = getSiteUrl();
  const path = `/slots/${encodeURIComponent(slotId)}`;
  const url = new URL(path, base);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "slot_invite");
  return url.toString();
}
