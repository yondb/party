"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type NotificationPrefs = {
  email_transactional: boolean;
  marketing_opt_in: boolean;
};

export async function updateNotificationPrefs(prefs: NotificationPrefs) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.auth.updateUser({
    data: {
      ...(user.user_metadata as Record<string, unknown>),
      notify_email_transactional: prefs.email_transactional,
      marketing_opt_in: prefs.marketing_opt_in,
    },
  });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
