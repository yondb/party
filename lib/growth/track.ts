import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const GROWTH_EVENT_NAMES = [
  "invite_viewed",
  "invite_cta_clicked",
  "share_copy_generated",
  "share_native_clicked",
  "share_copied",
  "signup_with_attribution",
  "slot_created",
  "application_sent",
  "application_accepted",
  "match_digest_sent",
  "host_share_nudge_sent",
  "supply_slot_created",
  "reengage_sent",
  "social_queued",
] as const;

export type GrowthEventName = (typeof GROWTH_EVENT_NAMES)[number];

export type TrackGrowthInput = {
  event_name: GrowthEventName | string;
  user_id?: string | null;
  slot_id?: string | null;
  place_id?: string | null;
  properties?: Record<string, unknown>;
};

export async function trackGrowthEvent(input: TrackGrowthInput): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, reason: "no_service_role" };
  }
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("growth_events").insert({
      event_name: input.event_name,
      user_id: input.user_id ?? null,
      slot_id: input.slot_id ?? null,
      place_id: input.place_id ?? null,
      properties: input.properties ?? {},
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
