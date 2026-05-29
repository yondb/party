"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerLang } from "@/lib/i18n-server";
import { commonErrors } from "@/lib/i18n-ui";
import { isOverRateLimit } from "@/lib/action-rate-limit";

export async function reportProfile(reportedUserId: string, reason: string) {
  const supabase = await createClient();
  const lang = await getServerLang();
  const errs = commonErrors(lang);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: errs.unauthorized };
  if (user.id === reportedUserId) return { error: "Cannot report yourself" };

  if (await isOverRateLimit(supabase, user.id, "reports")) {
    return { error: errs.rateReports };
  }

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
