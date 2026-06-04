import { NextResponse } from "next/server";
import { trackGrowthEvent } from "@/lib/growth/track";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let body: {
    event_name?: string;
    slot_id?: string;
    place_id?: string;
    properties?: Record<string, unknown>;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event_name = body.event_name?.trim();
  if (!event_name) {
    return NextResponse.json({ error: "event_name required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await trackGrowthEvent({
    event_name,
    user_id: user?.id ?? null,
    slot_id: body.slot_id?.trim() || null,
    place_id: body.place_id?.trim() || null,
    properties: body.properties,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
