import type { SupabaseClient } from "@supabase/supabase-js";
import { peersForSlot, isSlotParticipant } from "@/lib/slot-participants";

export type PendingRatingSlot = {
  slotId: string;
  title: string;
  pendingCount: number;
  rateHref: string;
};

type SlotRow = {
  id: string;
  title: string;
  host_id: string;
  status: string;
  date_time: string;
};

export async function getPendingRatingSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<PendingRatingSlot[]> {
  const { data: hosted } = await supabase
    .from("slots")
    .select("id, title, host_id, status, date_time")
    .eq("host_id", userId)
    .eq("status", "completed");

  const { data: guestApps } = await supabase
    .from("applications")
    .select("slot_id")
    .eq("applicant_id", userId)
    .eq("status", "accepted");

  const guestSlotIds = Array.from(new Set((guestApps ?? []).map((a) => a.slot_id)));
  const { data: guestSlots } = guestSlotIds.length
    ? await supabase
        .from("slots")
        .select("id, title, host_id, status, date_time")
        .in("id", guestSlotIds)
        .eq("status", "completed")
    : { data: [] as SlotRow[] };

  const slotMap = new Map<string, SlotRow>();
  for (const s of [...(hosted ?? []), ...(guestSlots ?? [])]) {
    slotMap.set(s.id, s);
  }
  const slots = Array.from(slotMap.values());
  if (slots.length === 0) return [];

  const slotIds = slots.map((s) => s.id);

  const { data: allApps } = await supabase
    .from("applications")
    .select("slot_id, applicant_id, status")
    .in("slot_id", slotIds)
    .eq("status", "accepted");

  const acceptedBySlot = new Map<string, string[]>();
  for (const a of allApps ?? []) {
    const list = acceptedBySlot.get(a.slot_id) ?? [];
    list.push(a.applicant_id);
    acceptedBySlot.set(a.slot_id, list);
  }

  const { data: myRatings } = await supabase
    .from("ratings")
    .select("slot_id, rated_id")
    .eq("rater_id", userId)
    .in("slot_id", slotIds);

  const ratedBySlot = new Map<string, Set<string>>();
  for (const r of myRatings ?? []) {
    const set = ratedBySlot.get(r.slot_id) ?? new Set();
    set.add(r.rated_id);
    ratedBySlot.set(r.slot_id, set);
  }

  const pending: PendingRatingSlot[] = [];

  for (const slot of slots) {
    if (!isSlotParticipant(userId, slot.host_id, acceptedBySlot.get(slot.id) ?? [])) continue;

    const peers = peersForSlot(slot.host_id, acceptedBySlot.get(slot.id) ?? [], userId);
    const already = ratedBySlot.get(slot.id) ?? new Set();
    const remaining = peers.filter((id) => !already.has(id));
    if (remaining.length === 0) continue;

    pending.push({
      slotId: slot.id,
      title: slot.title,
      pendingCount: remaining.length,
      rateHref: `/slots/${slot.id}/rate`,
    });
  }

  return pending.sort((a, b) => a.title.localeCompare(b.title));
}
