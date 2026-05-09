"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerLang } from "@/lib/i18n-server";
import { genderApplyBlocked } from "@/lib/i18n-ui";

export async function applyToSlot(slotId: string, message?: string) {
  const supabase = createClient();
  const lang = getServerLang();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

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

  const { error } = await supabase.from("applications").insert({
    slot_id: slotId,
    applicant_id: user.id,
    message: message ?? null,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath(`/slots/${slotId}`);
  return { ok: true };
}

export async function respondToApplication(
  applicationId: string,
  decision: "accepted" | "rejected",
) {
  const supabase = createClient();
  const { data: row } = await supabase
    .from("applications")
    .select("slot_id")
    .eq("id", applicationId)
    .single();

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
  return { ok: true };
}
