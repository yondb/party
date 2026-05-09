"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EXP_REWARDS, QUEST_EXP, getLevelFromExp } from "@/lib/exp";
import { NO_SHOW_RELIABILITY_HIT, clampReliability } from "@/lib/reliability";

export type RatingInput = {
  rated_id: string;
  score: number;
  comment?: string | null;
  showed_up: boolean;
};

export async function submitSlotRatings(slotId: string, ratings: RatingInput[]) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: slot, error: slotErr } = await supabase
    .from("slots")
    .select("id, host_id")
    .eq("id", slotId)
    .single();
  if (slotErr || !slot) return { error: "Slot not found" };
  if (slot.host_id !== user.id) return { error: "Only host can finalize" };

  const rows = ratings.map((r) => ({
    slot_id: slotId,
    rater_id: user.id,
    rated_id: r.rated_id,
    score: r.score,
    comment: r.comment ?? null,
    showed_up: r.showed_up,
  }));

  const { error: insErr } = await supabase.from("ratings").insert(rows);
  if (insErr) return { error: insErr.message };

  for (const r of ratings) {
    const { data: ratedUser } = await supabase
      .from("users")
      .select("id, exp, reliability_score, total_activities")
      .eq("id", r.rated_id)
      .single();
    if (!ratedUser) continue;

    let expDelta = EXP_REWARDS.ACTIVITY_COMPLETED_PARTICIPANT;
    if (r.score === 5) expDelta += EXP_REWARDS.PERFECT_RATING_BONUS;
    if (r.score === 1) expDelta += EXP_REWARDS.BAD_RATING_PENALTY;
    if (!r.showed_up) expDelta += EXP_REWARDS.NO_SHOW_PENALTY;
    expDelta += r.showed_up ? QUEST_EXP.SHOW_UP_TASK_BONUS : QUEST_EXP.SHOW_UP_TASK_FAIL;
    if (r.score >= 4) expDelta += QUEST_EXP.TEAMWORK_TASK_BONUS;
    if (r.score <= 2) expDelta += QUEST_EXP.TEAMWORK_TASK_FAIL;

    // Special quest: complete 5 activities with the same rater.
    const { count: duoCount } = await supabase
      .from("ratings")
      .select("*", { count: "exact", head: true })
      .eq("rated_id", r.rated_id)
      .eq("rater_id", user.id);
    if ((duoCount ?? 0) === 5) {
      expDelta += QUEST_EXP.LOYAL_DUO_BONUS;
    }

    let rel = ratedUser.reliability_score ?? 1;
    if (!r.showed_up) rel = clampReliability(rel - NO_SHOW_RELIABILITY_HIT);

    const nextExp = Math.max(0, ratedUser.exp + expDelta);
    const level = getLevelFromExp(nextExp).level;

    await supabase
      .from("users")
      .update({
        exp: nextExp,
        level,
        reliability_score: rel,
        total_activities: (ratedUser.total_activities ?? 0) + 1,
      })
      .eq("id", r.rated_id);
  }

  const { data: hostUser } = await supabase
    .from("users")
    .select("id, exp, total_hosted")
    .eq("id", user.id)
    .single();
  if (hostUser) {
    const hadNoShow = ratings.some((r) => !r.showed_up);
    const hostQuestDelta = hadNoShow ? QUEST_EXP.HOST_MESSY_RUN_PENALTY : QUEST_EXP.HOST_CLEAN_RUN_BONUS;
    const hostExp = Math.max(0, hostUser.exp + EXP_REWARDS.ACTIVITY_COMPLETED_HOST + hostQuestDelta);
    await supabase
      .from("users")
      .update({
        exp: hostExp,
        level: getLevelFromExp(hostExp).level,
        total_hosted: (hostUser.total_hosted ?? 0) + 1,
      })
      .eq("id", user.id);
  }

  await supabase.from("slots").update({ status: "completed" }).eq("id", slotId);

  revalidatePath("/");
  revalidatePath(`/slots/${slotId}`);
  revalidatePath(`/slots/${slotId}/manage`);
  revalidatePath("/profile");
  return { ok: true };
}
