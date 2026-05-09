"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPusherServer } from "@/lib/pusher-server";
import { slotChannelName } from "@/lib/realtime-channels";

export async function sendSlotMessage(slotId: string, content: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("messages")
    .insert({ slot_id: slotId, sender_id: user.id, content })
    .select("id, content, created_at, sender_id")
    .single();

  if (error) return { error: error.message };

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger(slotChannelName(slotId), "new-message", {
      id: data.id,
      slot_id: slotId,
      sender_id: data.sender_id,
      content: data.content,
      created_at: data.created_at,
    });
  }

  revalidatePath(`/slots/${slotId}/chat`);
  return { ok: true, message: data };
}
