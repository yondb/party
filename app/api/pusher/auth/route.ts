import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPusherServer } from "@/lib/pusher-server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socket_id = params.get("socket_id");
  const channel_name = params.get("channel_name");
  if (!socket_id || !channel_name) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const pusher = getPusherServer();
  if (!pusher) {
    return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
  }

  if (channel_name === `private-user-${user.id}`) {
    const auth = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: user.id,
    });
    return NextResponse.json(auth);
  }

  const slotMatch = /^private-slot-(.+)$/.exec(channel_name);
  if (slotMatch) {
    const slotId = slotMatch[1];
    if (!UUID_RE.test(slotId)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    const { data: slot } = await supabase
      .from("slots")
      .select("host_id")
      .eq("id", slotId)
      .single();
    if (!slot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (slot.host_id === user.id) {
      const auth = pusher.authorizeChannel(socket_id, channel_name, {
        user_id: user.id,
      });
      return NextResponse.json(auth);
    }

    const { data: app } = await supabase
      .from("applications")
      .select("id")
      .eq("slot_id", slotId)
      .eq("applicant_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!app) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const auth = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: user.id,
    });
    return NextResponse.json(auth);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
