import type { SupabaseClient } from "@supabase/supabase-js";

/** Marks past open/full slots as completed and queues rating notifications. */
export async function runSlotLifecycle(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc("auto_complete_past_slots");
  if (error) {
    console.error("[slot-lifecycle] auto_complete_past_slots failed:", error.message);
  }
}
