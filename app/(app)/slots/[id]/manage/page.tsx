import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { ApplicationCard, type ApplicantRow } from "@/components/slots/ApplicationCard";
import { HostCompleteRatings } from "@/components/slots/HostCompleteRatings";

export const dynamic = "force-dynamic";

export default async function ManageSlotPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: slot, error } = await supabase
    .from("slots")
    .select("id, title, host_id, status")
    .eq("id", params.id)
    .single();
  if (error || !slot) notFound();
  if (!user || user.id !== slot.host_id) redirect(`/slots/${slot.id}`);

  const { data: apps } = await supabase
    .from("applications")
    .select("id, applicant_id, status, message")
    .eq("slot_id", slot.id)
    .order("created_at", { ascending: true });

  const applicantIds = Array.from(new Set((apps ?? []).map((a) => a.applicant_id)));
  const { data: users } = applicantIds.length
    ? await supabase
        .from("users")
        .select("id, name, avatar_url, level, exp, reliability_score")
        .in("id", applicantIds)
    : { data: [] as { id: string; name: string; avatar_url: string | null; level: number; exp: number; reliability_score: number }[] };

  const umap = new Map((users ?? []).map((u) => [u.id, u]));

  const rows: ApplicantRow[] = (apps ?? []).map((a) => {
    const u = umap.get(a.applicant_id);
    return {
      applicationId: a.id,
      userId: a.applicant_id,
      name: u?.name ?? "—",
      avatar_url: u?.avatar_url ?? null,
      level: u?.level ?? 1,
      exp: u?.exp ?? 0,
      reliability_score: u?.reliability_score ?? 1,
      message: a.message,
      status: a.status as ApplicantRow["status"],
    };
  });

  const acceptedParticipants = rows
    .filter((r) => r.status === "accepted")
    .map((r) => ({ id: r.userId, name: r.name }));

  const accepted = rows.filter((r) => r.status === "accepted");
  const pending = rows.filter((r) => r.status === "pending");
  const rejected = rows.filter((r) => r.status === "rejected");

  return (
    <div className="pb-6">
      <PageHeader title="Manage party" backHref={`/slots/${slot.id}`} />
      <p className="mb-4 text-sm text-[var(--text-muted)]">{slot.title}</p>

      {accepted.length ? (
        <section className="mb-6">
          <h2 className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--status-open)]">
            In party
          </h2>
          <ul className="flex flex-col gap-3">
            {accepted.map((r, i) => (
              <li key={r.applicationId}>
                <ApplicationCard row={r} index={i} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pending.length ? (
        <section className="mb-6">
          <h2 className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--status-pending)]">
            Pending
          </h2>
          <ul className="flex flex-col gap-3">
            {pending.map((r, i) => (
              <li key={r.applicationId}>
                <ApplicationCard row={r} index={i} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rejected.length ? (
        <section className="mb-6">
          <h2 className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--text-muted)]">
            Rejected
          </h2>
          <ul className="flex flex-col gap-3">
            {rejected.map((r, i) => (
              <li key={r.applicationId}>
                <ApplicationCard row={r} index={i} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-muted)]">No applications yet.</p>
      ) : null}

      {slot.status !== "completed" && slot.status !== "cancelled" ? (
        <HostCompleteRatings slotId={slot.id} participants={acceptedParticipants} />
      ) : (
        <p className="mt-4 text-center text-sm text-[var(--text-muted)]">Quest is completed or cancelled.</p>
      )}

      <Link href={`/slots/${slot.id}`} className="mt-6 block text-center text-sm text-[var(--gold-mid)]">
        Back to details
      </Link>
    </div>
  );
}

