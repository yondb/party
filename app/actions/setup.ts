"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completeSetup(input: {
  name: string;
  gender: "male" | "female";
  birth_date: string;
  avatar_url?: string | null;
  preferred_activities?: string[];
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

  const { error: authErr } = await supabase.auth.updateUser({
    data: {
      setup_done: true,
      preferred_activities: input.preferred_activities ?? [],
    },
  });
  if (authErr) return { error: authErr.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
