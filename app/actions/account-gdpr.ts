"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function exportUserDataJson(): Promise<
  { ok: true; json: string; filename: string } | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const uid = user.id;
  const [
    { data: profile },
    { data: slotsHosted },
    { data: applications },
    { data: ratingsGiven },
    { data: ratingsReceived },
    { data: messages },
    { data: notifications },
    { data: reportsMade },
    { data: reportsAgainst },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", uid).maybeSingle(),
    supabase.from("slots").select("*").eq("host_id", uid),
    supabase.from("applications").select("*").eq("applicant_id", uid),
    supabase.from("ratings").select("*").eq("rater_id", uid),
    supabase.from("ratings").select("*").eq("rated_id", uid),
    supabase.from("messages").select("*").eq("sender_id", uid),
    supabase.from("notifications").select("*").eq("user_id", uid),
    supabase.from("profile_reports").select("*").eq("reporter_id", uid),
    supabase.from("profile_reports").select("*").eq("reported_user_id", uid),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: uid,
    email: user.email,
    user_metadata: user.user_metadata,
    profile: profile ?? null,
    slots_hosted: slotsHosted ?? [],
    applications: applications ?? [],
    ratings_given: ratingsGiven ?? [],
    ratings_received: ratingsReceived ?? [],
    messages: messages ?? [],
    notifications: notifications ?? [],
    profile_reports_made: reportsMade ?? [],
    profile_reports_against: reportsAgainst ?? [],
  };

  const json = JSON.stringify(payload, null, 2);
  return { ok: true, json, filename: `partyfinder-export-${uid.slice(0, 8)}.json` };
}

export async function deleteOwnAccount(): Promise<
  { ok: true } | { ok: false; error: "unauthorized" | "no_service_role" | string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "no_service_role" };
  }

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
