import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { SlotRateForm } from "@/components/slots/SlotRateForm";
import { pageHeaderUi, slotRateUi } from "@/lib/i18n-ui";
import { peersForSlot, isSlotParticipant } from "@/lib/slot-participants";
import { runSlotLifecycle } from "@/lib/slot-lifecycle";

export const dynamic = "force-dynamic";

export default async function RateSlotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = slotRateUi();
  const back = pageHeaderUi();
  const supabase = await createClient();
  await runSlotLifecycle(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: slot } = await supabase
    .from("slots")
    .select("id, title, host_id, status, places(name)")
    .eq("id", id)
    .single();

  if (!slot) notFound();
  if (slot.status !== "completed") redirect(`/slots/${id}`);

  const { data: accepted } = await supabase
    .from("applications")
    .select("applicant_id")
    .eq("slot_id", id)
    .eq("status", "accepted");

  const acceptedIds = (accepted ?? []).map((a) => a.applicant_id);
  if (!isSlotParticipant(user.id, slot.host_id, acceptedIds)) {
    redirect(`/slots/${id}`);
  }

  const peerIds = peersForSlot(slot.host_id, acceptedIds, user.id);

  const { data: existing } = await supabase
    .from("ratings")
    .select("rated_id")
    .eq("slot_id", id)
    .eq("rater_id", user.id);

  const already = new Set((existing ?? []).map((r) => r.rated_id));
  const remainingIds = peerIds.filter((id) => !already.has(id));

  if (remainingIds.length === 0) {
    return (<div className="pb-6">
        <PageHeader title={t.title} backHref={`/slots/${id}`} backLabel={back.back} />
        <p className="floating-card rounded-lg p-6 text-center text-sm text-[var(--text-muted)]">{t.allDone}</p>
        <Link href="/profile" className="mt-4 block text-center text-sm text-[var(--accent)]">
          {t.backProfile}
        </Link>
      </div>
    );
  }

  const { data: users } = await supabase.from("users").select("id, name").in("id", remainingIds);
  const peers = (users ?? []).map((u) => ({ id: u.id, name: u.name }));

  const placeRow = slot.places as { name?: string } | { name?: string }[] | null;
  const placeName = Array.isArray(placeRow) ? placeRow[0]?.name : placeRow?.name;

  return (<div className="pb-6">
      <PageHeader title={t.title} backHref={`/slots/${id}`} backLabel={back.back} />
      <p className="mb-1 text-lg font-semibold text-[var(--text-primary)]">{placeName ?? slot.title}</p>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{t.subtitle}</p>
      <SlotRateForm slotId={id} peers={peers} />
    </div>
  );
}
