"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerLang } from "@/lib/i18n-server";
import { commonErrors, genderApplyBlocked } from "@/lib/i18n-ui";
import { isOverRateLimit } from "@/lib/action-rate-limit";
import { sendTransactionalEmail } from "@/lib/email";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SITE_NAME } from "@/lib/site";

export async function applyToSlot(slotId: string, message?: string) {
  const supabase = await createClient();
  const lang = await getServerLang();
  const errs = commonErrors(lang);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: errs.unauthorized };

  if (await isOverRateLimit(supabase, user.id, "applications")) {
    return { error: errs.rateApplications };
  }

  const [{ data: slot }, { data: applicant }] = await Promise.all([
    supabase.from("slots").select("gender_scope").eq("id", slotId).maybeSingle(),
    supabase.from("users").select("gender").eq("id", user.id).maybeSingle(),
  ]);

  const scopeRaw = (slot?.gender_scope as string | undefined) ?? "any";
  const scope = scopeRaw === "female" || scopeRaw === "male" ? scopeRaw : "any";
  const userGender = applicant?.gender === "male" || applicant?.gender === "female" ? applicant.gender : null;

  if (scope === "female" && userGender !== "female") {
    return { error: genderApplyBlocked(lang, "female") };
  }
  if (scope === "male" && userGender !== "male") {
    return { error: genderApplyBlocked(lang, "male") };
  }

  const trimmedMessage = message?.trim().slice(0, 1000) || null;

  const { error } = await supabase.from("applications").insert({
    slot_id: slotId,
    applicant_id: user.id,
    message: trimmedMessage,
    status: "pending",
  });

  if (error) return { error: error.message || errs.generic };
  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath(`/slots/${slotId}`);
  return { ok: true };
}

async function notifyApplicationAccepted(slotId: string, applicantId: string) {
  if (!process.env.RESEND_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const admin = createServiceRoleClient();
    const [{ data: slot }, { data: authBundle, error: authErr }] = await Promise.all([
      admin.from("slots").select("title").eq("id", slotId).maybeSingle(),
      admin.auth.admin.getUserById(applicantId),
    ]);
    if (authErr || !authBundle?.user?.email) return;
    const email = authBundle.user.email;
    const meta = authBundle.user.user_metadata as Record<string, unknown> | undefined;
    if (meta?.notify_email_transactional === false) return;

    const title = slot?.title ?? `${SITE_NAME} quest`;
    await sendTransactionalEmail({
      to: email,
      subject: `Accepted: ${title}`,
      html: `<p>You were accepted to <strong>${escapeHtml(title)}</strong>.</p><p>Open the app to join the party chat.</p>`,
    });
  } catch {
    // non-fatal
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function respondToApplication(
  applicationId: string,
  decision: "accepted" | "rejected" | "pending",
) {
  const supabase = await createClient();
  const lang = await getServerLang();
  const errs = commonErrors(lang);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: errs.unauthorized };

  const { data: row, error: fetchErr } = await supabase
    .from("applications")
    .select("slot_id, applicant_id, status")
    .eq("id", applicationId)
    .single();

  if (fetchErr || !row) return { error: fetchErr?.message ?? "Not found" };

  // Only the slot host may accept/reject applications.
  const { data: slot } = await supabase
    .from("slots")
    .select("host_id")
    .eq("id", row.slot_id)
    .maybeSingle();
  if (!slot || slot.host_id !== user.id) return { error: errs.unauthorized };

  const prev = row.status;
  const { error } = await supabase
    .from("applications")
    .update({ status: decision })
    .eq("id", applicationId);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/notifications");
  if (row?.slot_id) {
    revalidatePath(`/slots/${row.slot_id}`);
    revalidatePath(`/slots/${row.slot_id}/manage`);
  }
  if (decision === "accepted" && prev === "pending" && row?.slot_id && row?.applicant_id) {
    void notifyApplicationAccepted(row.slot_id, row.applicant_id);
  }
  return { ok: true };
}
