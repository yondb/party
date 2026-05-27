import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewSlotWizard } from "@/components/slots/NewSlotWizard";
import { SlotCreateForm } from "@/components/slots/SlotCreateForm";
import type { PlaceRow } from "@/lib/places";

export const dynamic = "force-dynamic";

type Search = { place_id?: string };

export default async function NewSlotPage({ searchParams }: { searchParams: Search }) {
  if (!searchParams.place_id?.trim()) {
    redirect("/map");
  }

  const supabase = createClient();
  const { data: places } = await supabase
    .from("places")
    .select("id, name, category, lat, lng, city, district, is_free, description, osm_id")
    .order("name");

  const place = (places ?? []).find((p) => p.id === searchParams.place_id);

  return (
    <>
      <NewSlotWizard initialPlaceName={place?.name ?? ""} placeId={searchParams.place_id} />
      <div className="page-shell py-8 hidden">
        <Suspense fallback={<div className="py-12 text-center text-ash-400">…</div>}>
          <SlotCreateForm
            places={(places ?? []) as PlaceRow[]}
            initialPlaceId={searchParams.place_id}
          />
        </Suspense>
      </div>
    </>
  );
}
