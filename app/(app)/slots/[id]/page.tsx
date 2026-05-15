import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { getActivity } from "@/lib/activities";
import { getServerLang } from "@/lib/i18n-server";
import { pageHeaderUi, slotAudienceBadge, slotDetailUi } from "@/lib/i18n-ui";
import { ActivityIcon } from "@/components/slots/ActivityIcon";
import { Avatar } from "@/components/ui/Avatar";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ReliabilityScore } from "@/components/ui/ReliabilityScore";
import { ApplyToPartyForm } from "@/components/slots/ApplyToPartyForm";

export const dynamic = "force-dynamic";

export default async function SlotDetailPage({ params }: { params: { id: string } }) {
  const lang = getServerLang();
  const d = slotDetailUi(lang);
  const back = pageHeaderUi(lang);
  const locale = lang === "pl" ? "pl-PL" : "en-GB";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: slot, error } = await supabase
    .from("slots")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !slot) notFound();

  const { data: host } = await supabase
    .from("users")
    .select("id, name, avatar_url, reliability_score, level, exp")
    .eq("id", slot.host_id)
    .single();

  const { data: accepted } = await supabase
    .from("applications")
    .select("applicant_id")
    .eq("slot_id", slot.id)
    .eq("status", "accepted");

  const memberIds = Array.from(new Set((accepted ?? []).map((a) => a.applicant_id)));
  const { data: memberUsers } = memberIds.length
    ? await supabase
        .from("users")
        .select("id, name, avatar_url")
        .in("id", memberIds)
    : { data: [] as { id: string; name: string; avatar_url: string | null }[] };

  const cleanMembers = memberUsers ?? [];

  type AppStatus = "none" | "pending" | "accepted" | "rejected";
  let myApp: AppStatus = "none";
  if (user && user.id !== slot.host_id) {
    const { data: app } = await supabase
      .from("applications")
      .select("status")
      .eq("slot_id", slot.id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    if (app?.status) myApp = app.status as AppStatus;
  }

  const isHost = user?.id === slot.host_id;
  const inParty = isHost || myApp === "accepted";
  const guestCap = Math.max(1, slot.max_spots - 1);
  const full = slot.status === "full" || slot.spots_taken >= guestCap;
  const canHostEdit = isHost && (slot.status === "open" || slot.status === "full");

  const act = getActivity(slot.activity_type);
  const audienceLine = slotAudienceBadge(lang, (slot as { gender_scope?: string | null }).gender_scope);

  return (
    <div className="pb-6">
      <PageHeader title={d.quest} backHref="/feed" backLabel={back.back} />
      <div
        className="wow-card relative overflow-hidden rounded-lg p-0"
        style={{ borderTop: `3px solid ${act.color}` }}
      >
        <div className="flex items-start gap-4 p-4" style={{ background: act.gradient }}>
          <ActivityIcon activityType={slot.activity_type} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-bold text-white drop-shadow-md">
              {slot.title}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {new Date(slot.date_time).toLocaleString(locale, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="mt-2 text-sm text-white/85">📍 {slot.location_name}</p>
          </div>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          {audienceLine ? (
            <p className="rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] px-3 py-2.5 text-center text-sm font-medium text-[var(--gold-mid)]">
              {audienceLine}
            </p>
          ) : null}
          {host ? (
            <section>
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {d.host}
              </h2>
              <Link href={`/profile/${host.id}`} className="mt-2 flex items-center gap-3">
                <Avatar src={host.avatar_url} name={host.name} size={48} />
                <div>
                  <p className="font-display text-lg text-[var(--text-bright)]">{host.name}</p>
                  <div className="flex items-center gap-2">
                    <LevelBadge level={host.level} />
                    <ReliabilityScore score={host.reliability_score ?? 1} />
                  </div>
                </div>
              </Link>
            </section>
          ) : null}

          {slot.description ? (
            <p className="text-base leading-relaxed text-[var(--text-secondary)]">{slot.description}</p>
          ) : null}

          <section>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {d.partyMembers}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {host ? (
                <span className="flex items-center gap-1 rounded-full border border-[var(--gold-dim)] px-2.5 py-1.5 text-sm">
                  <Avatar src={host.avatar_url} name={host.name} size={24} />
                  {host.name} ({d.hostTag})
                </span>
              ) : null}
              {cleanMembers.map((m) => (
                <span
                  key={m.id}
                  className="flex items-center gap-1 rounded-full border border-[var(--gold-dim)] px-2.5 py-1.5 text-sm"
                >
                  <Avatar src={m.avatar_url} name={m.name} size={24} />
                  {m.name}
                </span>
              ))}
            </div>
            <p className="mt-2 text-base text-[var(--text-muted)]">
              {d.openSpots}: {Math.max(0, guestCap - slot.spots_taken)} / {guestCap}
            </p>
          </section>

          <div className="flex flex-wrap gap-2">
            {isHost ? (
              <Link
                href={`/slots/${slot.id}/manage`}
                className="btn-primary inline-flex min-h-[3rem] flex-1 min-w-[10rem] items-center justify-center rounded-md px-4 py-3 text-center font-display text-base font-bold uppercase tracking-[0.08em]"
              >
                {d.manage}
              </Link>
            ) : null}
            {canHostEdit ? (
              <Link
                href={`/slots/${slot.id}/edit`}
                className="btn-secondary inline-flex min-h-[3rem] flex-1 min-w-[10rem] items-center justify-center rounded-md px-4 py-3 text-center font-display text-base font-semibold uppercase tracking-[0.08em]"
              >
                {d.editQuest}
              </Link>
            ) : null}
            {inParty ? (
              <Link
                href={`/slots/${slot.id}/chat`}
                className="btn-secondary inline-flex min-h-[3rem] flex-1 min-w-[10rem] items-center justify-center rounded-md px-4 py-3 text-center font-display text-base font-semibold uppercase tracking-[0.08em]"
              >
                {d.chat}
              </Link>
            ) : null}
          </div>

          {!isHost && !full && myApp === "none" ? <ApplyToPartyForm slotId={slot.id} /> : null}
          {!isHost && myApp === "pending" ? (
            <p className="text-center text-sm text-[var(--status-pending)]">{d.waiting}</p>
          ) : null}
          {!isHost && myApp === "rejected" ? (
            <p className="text-center text-sm text-[var(--text-muted)]">{d.rejected}</p>
          ) : null}
          {full && !isHost && myApp !== "accepted" ? (
            <p className="text-center text-sm text-[var(--status-full)]">{d.full}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

