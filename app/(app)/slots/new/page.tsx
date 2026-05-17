import { createClient } from "@/lib/supabase/server";
import { SlotCreateForm } from "@/components/slots/SlotCreateForm";
import type { PlaceRow } from "@/lib/places";

export const dynamic = "force-dynamic";

type Search = { place_id?: string };

export default async function NewSlotPage({ searchParams }: { searchParams: Search }) {
  const supabase = createClient();
  const { data: places } = await supabase
    .from("places")
    .select("id, name, category, lat, lng, city, district, is_free, description, osm_id")
    .order("name");

  return (
    <SlotCreateForm
      places={(places ?? []) as PlaceRow[]}
      initialPlaceId={searchParams.place_id}
    />
  );
}
