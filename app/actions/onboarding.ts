"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(displayName: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = displayName.trim() || "Adventurer";

  const { error: uerr } = await supabase.auth.updateUser({
    data: { onboarding_done: true },
  });
  if (uerr) return { error: uerr.message };

  const { error: perr } = await supabase
    .from("users")
    .update({ name })
    .eq("id", user.id);
  if (perr) return { error: perr.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
