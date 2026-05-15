import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SlotForm, type SlotFormEdit } from "@/components/slots/SlotForm";
import { getServerLang } from "@/lib/i18n-server";
import { normalizeActivityKey, type ActivityKey } from "@/lib/activities";
import { splitCustomActivityDescription, toDateTimeLocalValue } from "@/lib/slot-edit-form";

export const dynamic = "force-dynamic";

export default async function EditSlotPage({ params }: { params: { id: string } }) {
  const lang = getServerLang();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: slot, error } = await supabase.from("slots").select("*").eq("id", params.id).single();
  if (error || !slot) notFound();
  if (!user || user.id !== slot.host_id) redirect(`/slots/${slot.id}`);
  if (slot.status !== "open" && slot.status !== "full") {
    redirect(`/slots/${slot.id}/manage`);
  }

  const actKey = normalizeActivityKey(slot.activity_type) as ActivityKey;
  const { other, body } =
    actKey === "other"
      ? splitCustomActivityDescription(slot.description, lang)
      : { other: "", body: slot.description ?? "" };

  const scopeRaw = (slot as { gender_scope?: string }).gender_scope ?? "any";
  const gender_scope =
    scopeRaw === "female" || scopeRaw === "male" ? scopeRaw : "any";

  const edit: SlotFormEdit = {
    slotId: slot.id,
    activity_type: actKey,
    title: slot.title,
    description: body,
    otherActivity: other,
    dateTimeLocal: toDateTimeLocalValue(slot.date_time),
    location_name: slot.location_name,
    lat: slot.location_lat,
    lng: slot.location_lng,
    max_spots: slot.max_spots,
    minRelPercent: Math.round(Number(slot.min_reliability ?? 0) * 100),
    min_level: slot.min_level ?? 0,
    recurring: Boolean(slot.recurring),
    recurring_pattern: slot.recurring_pattern,
    gender_scope,
  };

  return <SlotForm edit={edit} />;
}
