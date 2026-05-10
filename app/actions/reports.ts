"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function reportProfile(reportedUserId: string, reason: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (user.id === reportedUserId) return { error: "Cannot report yourself" };

  const trimmed = reason.trim();
  if (trimmed.length < 10) return { error: "Description must be at least 10 characters." };
  if (trimmed.length > 2000) return { error: "Description is too long (max 2000 characters)." };

  const { error } = await supabase.from("profile_reports").insert({
    reported_user_id: reportedUserId,
    reporter_id: user.id,
    reason: trimmed,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath(`/profile/${reportedUserId}`);
  revalidatePath("/admin");
  return { ok: true };
}
