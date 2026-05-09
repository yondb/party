"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return;
  revalidatePath("/notifications");
}

export async function markNotificationReadForm(formData: FormData) {
  const id = formData.get("nid");
  if (typeof id !== "string" || !id) return;
  await markNotificationRead(id);
}

export async function markAllNotificationsRead() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return;
  revalidatePath("/notifications");
}
