import { createClient } from "@/lib/supabase/server";
import { NewSlotWizard, type PlaceOption } from "@/components/slots/NewSlotWizard";
import { FREE_PLACE_CATEGORIES } from "@/lib/places";

export const dynamic = "force-dynamic";

type Search = { place_id?: string };

export default async function NewSlotPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: places } = await supabase
    .from("places")
    .select("id, name, lat, lng, city, district")
    .eq("is_free", true)
    .in("category", [...FREE_PLACE_CATEGORIES])
    .order("name");

  const options: PlaceOption[] = (places ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    city: p.city ?? null,
    district: p.district ?? null,
  }));

  return <NewSlotWizard places={options} initialPlaceId={params.place_id?.trim() || undefined} />;
}
