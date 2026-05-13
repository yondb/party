"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeActivityKey } from "@/lib/activities";

export type CreateSlotInput = {
  activity_type: string;
  title: string;
  description?: string;
  date_time: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  max_spots: number;
  min_reliability: number;
  min_level: number;
  recurring?: boolean;
  recurring_pattern?: string | null;
  /** Who may apply: everyone, women only, or men only */
  gender_scope?: "any" | "female" | "male";
};

const TITLE_MAX = 200;
const LOCATION_MAX = 200;
const DESCRIPTION_MAX = 12000;
const RECURRING_PATTERN_MAX = 500;

export async function createSlotAction(input: CreateSlotInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = input.title.trim();
  if (!title || title.length > TITLE_MAX) return { error: "Invalid title" };

  const location_name = input.location_name.trim();
  if (!location_name || location_name.length > LOCATION_MAX) return { error: "Invalid location" };

  const descriptionRaw = input.description?.trim();
  if (descriptionRaw && descriptionRaw.length > DESCRIPTION_MAX) return { error: "Description too long" };

  if (!Number.isFinite(input.location_lat) || !Number.isFinite(input.location_lng)) {
    return { error: "Invalid coordinates" };
  }
  if (Math.abs(input.location_lat) > 90 || Math.abs(input.location_lng) > 180) {
    return { error: "Invalid coordinates" };
  }

  const rawMax = Number(input.max_spots);
  const max_spots = Number.isFinite(rawMax)
    ? Math.min(8, Math.max(2, Math.floor(rawMax)))
    : 2;
  const rawLevel = Number(input.min_level);
  const min_level = Number.isFinite(rawLevel)
    ? Math.min(20, Math.max(0, Math.floor(rawLevel)))
    : 0;
  const rawRel = Number(input.min_reliability);
  const min_reliability = Number.isFinite(rawRel)
    ? Math.min(1, Math.max(0, rawRel))
    : 0;

  if (Number.isNaN(Date.parse(input.date_time))) {
    return { error: "Invalid date" };
  }

  const recurring = Boolean(input.recurring);
  let recurring_pattern: string | null = null;
  if (recurring) {
    const p = input.recurring_pattern?.trim() ?? "";
    if (p.length > RECURRING_PATTERN_MAX) return { error: "Pattern too long" };
    recurring_pattern = p || null;
  }

  const scope = input.gender_scope ?? "any";
  const gender_scope = scope === "female" || scope === "male" ? scope : "any";

  const activity_type = normalizeActivityKey(input.activity_type);

  const { data, error } = await supabase
    .from("slots")
    .insert({
      host_id: user.id,
      activity_type,
      title,
      description: descriptionRaw || null,
      date_time: input.date_time,
      location_name,
      location_lat: input.location_lat,
      location_lng: input.location_lng,
      max_spots,
      min_reliability,
      min_level,
      recurring,
      recurring_pattern,
      gender_scope,
      status: "open",
      spots_taken: 0,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/map");
  return { id: data.id };
}

export async function updateSlotStatus(slotId: string, status: "completed" | "cancelled") {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: slot, error: selErr } = await supabase
    .from("slots")
    .select("host_id")
    .eq("id", slotId)
    .maybeSingle();
  if (selErr || !slot) return { error: "Not found" };
  if (slot.host_id !== user.id) return { error: "Forbidden" };

  const { error } = await supabase.from("slots").update({ status }).eq("id", slotId);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath(`/slots/${slotId}`);
  revalidatePath(`/slots/${slotId}/manage`);
  return { ok: true };
}
