import { buildSlotShareUrl } from "@/lib/growth/share-url";
import { generateSlotShareCopy } from "@/lib/growth/share-copy";
import { MARKET_CITY } from "@/lib/market";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const CHANNELS = ["reddit", "nextdoor"] as const;

/** Auto-generate ready-to-post copy for top open slots (no manual writing). */
export async function runSocialQueueCron(): Promise<{
  ok: true;
  queued: number;
}> {
  const admin = createServiceRoleClient();
  const now = new Date();
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: places } = await admin.from("places").select("id").eq("city", MARKET_CITY);
  const placeIds = (places ?? []).map((p) => p.id);
  if (placeIds.length === 0) return { ok: true, queued: 0 };

  const { data: slots } = await admin
    .from("slots")
    .select("id, title, location_name, date_time, activity_type, max_spots, spots_taken, status")
    .eq("status", "open")
    .in("place_id", placeIds)
    .gte("date_time", now.toISOString())
    .lte("date_time", week.toISOString())
    .order("date_time", { ascending: true })
    .limit(5);

  let queued = 0;

  for (const slot of slots ?? []) {
    const copy = await generateSlotShareCopy(slot);
    for (const channel of CHANNELS) {
      const url = buildSlotShareUrl(slot.id, channel);
      const title =
        channel === "reddit"
          ? `[Austin] ${slot.title}`
          : `Dog walk invite — ${slot.location_name}`;

      const body =
        channel === "reddit"
          ? `${copy.text}\n\n${url}`
          : `Hi neighbors — ${copy.text}\n\nJoin: ${url}`;

      const { data: existing } = await admin
        .from("growth_content_queue")
        .select("id")
        .eq("slot_id", slot.id)
        .eq("channel", channel)
        .eq("status", "ready")
        .maybeSingle();

      if (existing) continue;

      const { error } = await admin.from("growth_content_queue").insert({
        slot_id: slot.id,
        channel,
        title,
        body,
        invite_url: url,
        status: "ready",
      });

      if (!error) queued += 1;
    }
  }

  return { ok: true, queued };
}
