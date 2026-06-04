import { createServiceRoleClient } from "@/lib/supabase/service-role";

/** Skip if same event already recorded for user/slot within window. */
export async function wasGrowthEventRecent(
  eventName: string,
  opts: { userId?: string; slotId?: string; withinHours?: number },
): Promise<boolean> {
  const admin = createServiceRoleClient();
  const hours = opts.withinHours ?? 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  let q = admin
    .from("growth_events")
    .select("id", { count: "exact", head: true })
    .eq("event_name", eventName)
    .gte("created_at", since);

  if (opts.userId) q = q.eq("user_id", opts.userId);
  if (opts.slotId) q = q.eq("slot_id", opts.slotId);

  const { count, error } = await q;
  if (error) return false;
  return (count ?? 0) > 0;
}
