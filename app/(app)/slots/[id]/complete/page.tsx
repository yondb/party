import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { HostCompleteRatings } from "@/components/slots/HostCompleteRatings";

export const dynamic = "force-dynamic";

export default async function CompleteSlotPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: slot } = await supabase
    .from("slots")
    .select("id, title, host_id")
    .eq("id", params.id)
    .single();

  if (!slot) redirect("/feed");
  if (!user || user.id !== slot.host_id) redirect(`/slots/${params.id}`);

  const { data: accepted } = await supabase
    .from("applications")
    .select("applicant_id")
    .eq("slot_id", params.id)
    .eq("status", "accepted");

  const participantIds = Array.from(new Set((accepted ?? []).map((a) => a.applicant_id)));
  const { data: users } = participantIds.length
    ? await supabase.from("users").select("id, name").in("id", participantIds)
    : { data: [] as { id: string; name: string }[] };

  return (
    <div className="pb-6">
      <PageHeader title="Complete quest" backHref={`/slots/${params.id}/manage`} />
      <p className="mb-3 text-sm text-[var(--text-muted)]">{slot.title}</p>
      <HostCompleteRatings slotId={params.id} participants={users ?? []} />
    </div>
  );
}
