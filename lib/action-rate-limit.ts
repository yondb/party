import type { SupabaseClient } from "@supabase/supabase-js";

const MESSAGE_WINDOW_MS = 60_000;
const MESSAGE_MAX = 40;
const APPLICATION_WINDOW_MS = 60 * 60_000;
const APPLICATION_MAX = 30;
const REPORT_WINDOW_MS = 60 * 60_000;
const REPORT_MAX = 20;
const SLOT_WINDOW_MS = 60 * 60_000;
const SLOT_MAX = 20;

export type RateLimitKind = "messages" | "applications" | "reports" | "slots";

/** Returns true if over limit (then block the action). */
export async function isOverRateLimit(
  supabase: SupabaseClient,
  userId: string,
  kind: RateLimitKind,
): Promise<boolean> {
  const now = Date.now();
  if (kind === "messages") {
    const since = new Date(now - MESSAGE_WINDOW_MS).toISOString();
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", userId)
      .gte("created_at", since);
    if (error) return true;
    return (count ?? 0) >= MESSAGE_MAX;
  }
  if (kind === "applications") {
    const since = new Date(now - APPLICATION_WINDOW_MS).toISOString();
    const { count, error } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("applicant_id", userId)
      .gte("created_at", since);
    if (error) return true;
    return (count ?? 0) >= APPLICATION_MAX;
  }
  if (kind === "slots") {
    const since = new Date(now - SLOT_WINDOW_MS).toISOString();
    const { count, error } = await supabase
      .from("slots")
      .select("id", { count: "exact", head: true })
      .eq("host_id", userId)
      .gte("created_at", since);
    if (error) return true;
    return (count ?? 0) >= SLOT_MAX;
  }
  const since = new Date(now - REPORT_WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("profile_reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", userId)
    .gte("created_at", since);
  if (error) return true;
  return (count ?? 0) >= REPORT_MAX;
}
