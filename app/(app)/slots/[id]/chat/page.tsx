import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SlotChat } from "@/components/slots/SlotChat";

export const dynamic = "force-dynamic";

export default async function SlotChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: slot } = await supabase
    .from("slots")
    .select("id, title, host_id")
    .eq("id", id)
    .single();
  if (!slot) notFound();

  const { data: accepted } = await supabase
    .from("applications")
    .select("id")
    .eq("slot_id", slot.id)
    .eq("applicant_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();

  const allowed = slot.host_id === user.id || !!accepted;
  if (!allowed) redirect(`/slots/${slot.id}`);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id")
    .eq("slot_id", slot.id)
    .order("created_at", { ascending: true });

  const senderIds = Array.from(new Set((messages ?? []).map((m) => m.sender_id)));
  const senderMap: Record<string, { name: string; avatar_url: string | null }> = {};
  if (senderIds.length) {
    const { data: senders } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .in("id", senderIds);
    (senders ?? []).forEach((u) => {
      senderMap[u.id] = { name: u.name, avatar_url: u.avatar_url };
    });
  }

  return (<SlotChat
      slotId={slot.id}
      hostId={slot.host_id}
      title={slot.title}
      initial={messages ?? []}
      currentUserId={user.id}
      senderMap={senderMap}
    />
  );
}
