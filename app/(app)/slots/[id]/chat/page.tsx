import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SlotChat } from "@/components/slots/SlotChat";

export const dynamic = "force-dynamic";

export default async function SlotChatPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: slot } = await supabase
    .from("slots")
    .select("id, title, host_id")
    .eq("id", params.id)
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

  return (
    <SlotChat
      slotId={slot.id}
      title={slot.title}
      initial={messages ?? []}
      currentUserId={user.id}
    />
  );
}
