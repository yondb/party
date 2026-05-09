"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function createSlotAction(input: CreateSlotInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const scope = input.gender_scope ?? "any";
  const gender_scope = scope === "female" || scope === "male" ? scope : "any";

  const { data, error } = await supabase
    .from("slots")
    .insert({
      host_id: user.id,
      activity_type: input.activity_type,
      title: input.title,
      description: input.description ?? null,
      date_time: input.date_time,
      location_name: input.location_name,
      location_lat: input.location_lat,
      location_lng: input.location_lng,
      max_spots: input.max_spots,
      min_reliability: input.min_reliability,
      min_level: input.min_level,
      recurring: input.recurring ?? false,
      recurring_pattern: input.recurring_pattern ?? null,
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
  const { error } = await supabase.from("slots").update({ status }).eq("id", slotId);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath(`/slots/${slotId}`);
  revalidatePath(`/slots/${slotId}/manage`);
  return { ok: true };
}
