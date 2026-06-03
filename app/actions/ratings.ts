"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EXP_REWARDS, QUEST_EXP, getLevelFromExp } from "@/lib/exp";
import { NO_SHOW_RELIABILITY_HIT, clampReliability } from "@/lib/reliability";
import { peersForSlot, isSlotParticipant } from "@/lib/slot-participants";

export type RatingInput = {
  rated_id: string;
  score: number;
  comment?: string | null;
  showed_up: boolean;
};

async function applyRatingEffects(supabase: Awaited<ReturnType<typeof createClient>>,
  params: { slotId: string; raterId: string; ratedId: string; score: number; showed_up: boolean },
) {
  const { raterId, ratedId, score, showed_up } = params;

  const { data: ratedUser } = await supabase
    .from("users")
    .select("id, exp, reliability_score, total_activities")
    .eq("id", ratedId)
    .single();
  if (!ratedUser) return;

  const { data: slot } = await supabase.from("slots").select("host_id").eq("id", params.slotId).single();
  const isHostRated = slot?.host_id === ratedId;

  let expDelta = isHostRated ? 0 : EXP_REWARDS.ACTIVITY_COMPLETED_PARTICIPANT;
  if (score === 5) expDelta += EXP_REWARDS.PERFECT_RATING_BONUS;
  if (score === 1) expDelta += EXP_REWARDS.BAD_RATING_PENALTY;
  if (!showed_up) expDelta += EXP_REWARDS.NO_SHOW_PENALTY;
  expDelta += showed_up ? QUEST_EXP.SHOW_UP_TASK_BONUS : QUEST_EXP.SHOW_UP_TASK_FAIL;
  if (score >= 4) expDelta += QUEST_EXP.TEAMWORK_TASK_BONUS;
  if (score <= 2) expDelta += QUEST_EXP.TEAMWORK_TASK_FAIL;

  if (isHostRated && raterId !== ratedId) {
    expDelta += showed_up ? QUEST_EXP.HOST_CLEAN_RUN_BONUS : QUEST_EXP.HOST_MESSY_RUN_PENALTY;
  }

  const { count: duoCount } = await supabase
    .from("ratings")
    .select("*", { count: "exact", head: true })
    .eq("rated_id", ratedId)
    .eq("rater_id", raterId);
  if ((duoCount ?? 0) === 5) {
    expDelta += QUEST_EXP.LOYAL_DUO_BONUS;
  }

  let rel = ratedUser.reliability_score ?? 1;
  if (!showed_up) rel = clampReliability(rel - NO_SHOW_RELIABILITY_HIT);

  const nextExp = Math.max(0, ratedUser.exp + expDelta);
  const level = getLevelFromExp(nextExp).level;

  await supabase
    .from("users")
    .update({
      exp: nextExp,
      level,
      reliability_score: rel,
      total_activities: isHostRated
        ? (ratedUser.total_activities ?? 0)
        : (ratedUser.total_activities ?? 0) + 1,
    })
    .eq("id", ratedId);
}

/** Any party member rates peers after the slot is completed. */
export async function submitMyRatings(slotId: string, ratings: RatingInput[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: slot, error: slotErr } = await supabase
    .from("slots")
    .select("id, host_id, status")
    .eq("id", slotId)
    .single();
  if (slotErr || !slot) return { error: "Slot not found" };
  if (slot.status !== "completed") return { error: "Slot is not completed yet" };

  const { data: accepted } = await supabase
    .from("applications")
    .select("applicant_id")
    .eq("slot_id", slotId)
    .eq("status", "accepted");

  const acceptedIds = (accepted ?? []).map((a) => a.applicant_id);
  if (!isSlotParticipant(user.id, slot.host_id, acceptedIds)) {
    return { error: "Forbidden" };
  }

  const allowedPeers = new Set(peersForSlot(slot.host_id, acceptedIds, user.id));
  if (ratings.length === 0) return { error: "No ratings" };

  const { data: existing } = await supabase
    .from("ratings")
    .select("rated_id")
    .eq("slot_id", slotId)
    .eq("rater_id", user.id);

  const already = new Set((existing ?? []).map((r) => r.rated_id));

  for (const r of ratings) {
    if (!allowedPeers.has(r.rated_id)) return { error: "Invalid participant" };
    if (already.has(r.rated_id)) return { error: "Already rated this person" };
    const score = Math.min(5, Math.max(1, Math.floor(Number(r.score))));
    if (!Number.isFinite(score)) return { error: "Invalid score" };
  }

  const rows = ratings.map((r) => ({
    slot_id: slotId,
    rater_id: user.id,
    rated_id: r.rated_id,
    score: Math.min(5, Math.max(1, Math.floor(r.score))),
    comment: r.comment?.trim() || null,
    showed_up: Boolean(r.showed_up),
  }));

  const { error: insErr } = await supabase.from("ratings").insert(rows);
  if (insErr) return { error: insErr.message };

  for (const r of rows) {
    await applyRatingEffects(supabase, {
      slotId,
      raterId: user.id,
      ratedId: r.rated_id,
      score: r.score,
      showed_up: r.showed_up,
    });
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
  revalidatePath(`/slots/${slotId}`);
  revalidatePath(`/slots/${slotId}/rate`);
  revalidatePath(`/slots/${slotId}/manage`);
  return { ok: true };
}

/** @deprecated Use submitMyRatings — kept for backwards compatibility. */
export async function submitSlotRatings(slotId: string, ratings: RatingInput[]) {
  return submitMyRatings(slotId, ratings);
}
