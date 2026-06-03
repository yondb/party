import { NextResponse } from "next/server";
import { generateSlotShareCopy } from "@/lib/growth/share-copy";
import { getServerLang } from "@/lib/i18n-server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let body: { slotId?: string };
  try {
    body = (await req.json()) as { slotId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slotId = body.slotId?.trim();
  if (!slotId) {
    return NextResponse.json({ error: "slotId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: slot, error } = await supabase
    .from("slots")
    .select("id, title, location_name, date_time, activity_type, max_spots, spots_taken, status")
    .eq("id", slotId)
    .single();

  if (error || !slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  if (slot.status === "cancelled" || slot.status === "completed") {
    return NextResponse.json({ error: "Slot not shareable" }, { status: 400 });
  }

  const lang = await getServerLang();
  const copy = await generateSlotShareCopy(slot, lang);

  return NextResponse.json(copy);
}
