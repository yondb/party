import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SlotEditForm, type SlotEditInitial } from "@/components/slots/SlotEditForm";
import { isPlaceCategory, placeCategoryToActivityType, type PlaceCategory } from "@/lib/places";

export const dynamic = "force-dynamic";

export default async function EditSlotPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: slot, error } = await supabase
    .from("slots")
    .select("*, places(name, category)")
    .eq("id", params.id)
    .single();

  if (error || !slot) notFound();
  if (!user || user.id !== slot.host_id) redirect(`/slots/${slot.id}`);
  if (slot.status !== "open" && slot.status !== "full") {
    redirect(`/slots/${slot.id}/manage`);
  }

  const placeRow = slot.places as { name: string; category: string } | null;
  const place =
    placeRow && isPlaceCategory(placeRow.category)
      ? { name: placeRow.name, category: placeRow.category as PlaceCategory }
      : null;

  const initial: SlotEditInitial = {
    slotId: slot.id,
    title: slot.title,
    description: slot.description ?? "",
    date_time: slot.date_time,
    max_spots: slot.max_spots,
    gender_scope:
      slot.gender_scope === "female" || slot.gender_scope === "male" ? slot.gender_scope : "any",
    activity_type: place ? placeCategoryToActivityType(place.category) : slot.activity_type,
    location_name: slot.location_name,
    location_lat: slot.location_lat,
    location_lng: slot.location_lng,
    place,
  };

  return <SlotEditForm initial={initial} />;
}
