import type { SupabaseClient } from "@supabase/supabase-js";

/** Marks past open/full slots as completed and queues rating notifications. */
export async function runSlotLifecycle(supabase: SupabaseClient) {
  await supabase.rpc("auto_complete_past_slots");
}
