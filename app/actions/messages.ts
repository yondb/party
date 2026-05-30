"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerLang } from "@/lib/i18n-server";
import { commonErrors } from "@/lib/i18n-ui";
import { isOverRateLimit } from "@/lib/action-rate-limit";
import { getPusherServer } from "@/lib/pusher-server";
import { slotChannelName } from "@/lib/realtime-channels";

export async function sendSlotMessage(slotId: string, content: string) {
  const supabase = await createClient();
  const lang = await getServerLang();
  const errs = commonErrors(lang);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: errs.unauthorized };

  if (await isOverRateLimit(supabase, user.id, "messages")) {
    return { error: errs.rateMessages };
  }

  const trimmed = content.trim();
  if (!trimmed) return { error: errs.generic };
  if (trimmed.length > 4000) {
    return { error: lang === "pl" ? "Wiadomość jest za długa (max 4000 znaków)." : "Message is too long (max 4000 characters)." };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ slot_id: slotId, sender_id: user.id, content: trimmed })
    .select("id, content, created_at, sender_id")
    .single();

  if (error) return { error: error.message || errs.generic };

  const { data: sender } = await supabase
    .from("users")
    .select("name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger(slotChannelName(slotId), "new-message", {
      id: data.id,
      slot_id: slotId,
      sender_id: data.sender_id,
      content: data.content,
      created_at: data.created_at,
      sender_name: sender?.name ?? null,
      sender_avatar: sender?.avatar_url ?? null,
    });
  }

  revalidatePath(`/slots/${slotId}/chat`);
  return { ok: true, message: data };
}
