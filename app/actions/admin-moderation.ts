"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isAdminUser } from "@/lib/admin";

async function requireAdmin(): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) return { error: "Unauthorized" };
  return {};
}

export async function dismissProfileReport(reportId: string) {
  const gate = await requireAdmin();
  if (gate.error) return { error: gate.error };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("profile_reports")
    .update({ status: "dismissed" })
    .eq("id", reportId)
    .eq("status", "pending");

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

/** Marks report resolved, sets DB ban flag, and bans auth session (Supabase Auth). */
export async function banUserFromReport(reportId: string, reportedUserId: string) {
  const gate = await requireAdmin();
  if (gate.error) return { error: gate.error };

  const admin = createServiceRoleClient();

  const { error: rErr } = await admin
    .from("profile_reports")
    .update({ status: "resolved" })
    .eq("id", reportId)
    .eq("status", "pending");
  if (rErr) return { error: rErr.message };

  const { error: uErr } = await admin.from("users").update({ banned: true }).eq("id", reportedUserId);
  if (uErr) return { error: uErr.message };

  const { error: authErr } = await admin.auth.admin.updateUserById(reportedUserId, {
    ban_duration: "876000h",
  });
  if (authErr) return { error: authErr.message };

  revalidatePath("/admin");
  revalidatePath(`/profile/${reportedUserId}`);
  return { ok: true };
}

export async function unbanUser(userId: string) {
  const gate = await requireAdmin();
  if (gate.error) return { error: gate.error };

  const admin = createServiceRoleClient();
  const { error: uErr } = await admin.from("users").update({ banned: false }).eq("id", userId);
  if (uErr) return { error: uErr.message };

  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (authErr) return { error: authErr.message };

  revalidatePath("/admin");
  revalidatePath(`/profile/${userId}`);
  return { ok: true };
}

/** Form: hidden `reportId` */
export async function dismissReportFormAction(formData: FormData): Promise<void> {
  const id = String(formData.get("reportId") ?? "").trim();
  if (!id) return;
  await dismissProfileReport(id);
}

/** Form: hidden `reportId`, `reportedUserId` */
export async function banReportFormAction(formData: FormData): Promise<void> {
  const reportId = String(formData.get("reportId") ?? "").trim();
  const reportedUserId = String(formData.get("reportedUserId") ?? "").trim();
  if (!reportId || !reportedUserId) return;
  await banUserFromReport(reportId, reportedUserId);
}

/** Form: text `userId` (UUID) */
export async function unbanUserFormAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return;
  await unbanUser(userId);
}
