import { getSiteUrl } from "@/lib/site";

export type ShareChannel = "share" | "reddit" | "email_digest" | "nextdoor" | "copy";

const CHANNEL_SOURCE: Record<ShareChannel, string> = {
  share: "share",
  reddit: "reddit",
  email_digest: "email_digest",
  nextdoor: "nextdoor",
  copy: "copy",
};

export function buildSlotShareUrl(slotId: string, channel: ShareChannel = "share"): string {
  const base = getSiteUrl();
  const path = `/invite/${encodeURIComponent(slotId)}`;
  const url = new URL(path, base);
  url.searchParams.set("utm_source", CHANNEL_SOURCE[channel]);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "slot_invite");
  url.searchParams.set("ref_slot", slotId);
  return url.toString();
}
