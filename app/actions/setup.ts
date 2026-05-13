"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completeSetup(input: {
  name: string;
  gender: "male" | "female";
  birth_date: string;
  avatar_url?: string | null;
  preferred_activities?: string[];
  home_city?: string | null;
  quest_goals?: string | null;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates: {
    name: string;
    gender: "male" | "female";
    birth_date: string;
    avatar_url?: string | null;
  } = {
    name: input.name.trim() || "Adventurer",
    gender: input.gender,
    birth_date: input.birth_date,
  };
  if (input.avatar_url !== undefined) updates.avatar_url = input.avatar_url;

  const { error: profileErr } = await supabase.from("users").update(updates).eq("id", user.id);
  if (profileErr) return { error: profileErr.message };

  const prevMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const meta: Record<string, unknown> = {
    ...prevMeta,
    setup_done: true,
    preferred_activities: input.preferred_activities ?? [],
  };
  if (input.home_city?.trim()) meta.home_city = input.home_city.trim();
  if (input.quest_goals?.trim()) meta.quest_goals = input.quest_goals.trim();

  const { error: authErr } = await supabase.auth.updateUser({
    data: meta,
  });
  if (authErr) return { error: authErr.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
