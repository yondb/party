import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { signOut } from "@/app/actions/profile";
import { normalizeActivityKey, type ActivityKey } from "@/lib/activities";
import { getServerLang } from "@/lib/i18n-server";
import { profileUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage() {
  const lang = getServerLang();
  const p = profileUi(lang);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth");

  const { data: apps } = await supabase
    .from("applications")
    .select("slot_id, status")
    .eq("applicant_id", user.id)
    .eq("status", "accepted");

  const slotIds = Array.from(new Set((apps ?? []).map((a) => a.slot_id)));
  const { data: slots } = slotIds.length
    ? await supabase
        .from("slots")
        .select("id, activity_type, status, date_time")
        .in("id", slotIds)
    : { data: [] as { id: string; activity_type: string; status: string; date_time: string }[] };

  const activityCounts: Partial<Record<ActivityKey, number>> = {};
  for (const s of slots ?? []) {
    if (s.status !== "completed") continue;
    const k = normalizeActivityKey(s.activity_type);
    activityCounts[k] = (activityCounts[k] ?? 0) + 1;
  }

  const { data: ratings } = await supabase
    .from("ratings")
    .select("score, rater_id")
    .eq("rated_id", user.id);

  const avg =
    ratings && ratings.length > 0
      ? ratings.reduce((a, r) => a + r.score, 0) / ratings.length
      : null;

  const partnerCounts = new Map<string, number>();
  for (const r of ratings ?? []) {
    partnerCounts.set(r.rater_id, (partnerCounts.get(r.rater_id) ?? 0) + 1);
  }
  const samePersonRuns = Math.max(0, ...Array.from(partnerCounts.values()));
  const socialButterfly = partnerCounts.size >= 8;
  const completionKeys: ActivityKey[] = [
    "running",
    "coffee",
    "volleyball",
    "cycling",
    "boardgames",
    "gym",
    "hiking",
    "walking",
    "yoga",
    "movies",
  ];
  const completionist = completionKeys.every((k) => (activityCounts[k] ?? 0) > 0);
  const createdAt = new Date(profile.birth_date ?? profile.created_at);
  const anniversaryQuest = (slots ?? []).some((s) => {
    if (s.status !== "completed") return false;
    const d = new Date(s.date_time);
    return d.getUTCMonth() === createdAt.getUTCMonth() && d.getUTCDate() === createdAt.getUTCDate();
  });
  const hostAndPlayerMaster = (profile.total_hosted ?? 0) >= 10 && (profile.total_activities ?? 0) >= 10;

  return (
    <div className="page-shell py-8 pb-10">
      <PageHeader
        title={p.title}
        right={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/settings"
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-md border border-[var(--gold-dim)] px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:border-[var(--gold-mid)] hover:text-[var(--gold-bright)]"
            >
              {p.settings}
            </Link>
            <Link
              href="/profile/edit"
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-md border-2 border-[var(--gold-dim)] bg-[linear-gradient(180deg,#2a2210,#14110c)] px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-[var(--gold-bright)] shadow-[var(--shadow-glow-gold)] transition hover:border-[var(--gold-bright)] hover:brightness-110"
            >
              {p.edit}
            </Link>
          </div>
        }
      />
      <ProfileCard
        user={{
          id: profile.id,
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          gender: profile.gender === "male" ? "male" : "female",
          birth_date: profile.birth_date ?? "2000-01-01",
          reliability_score: profile.reliability_score ?? 1,
          exp: profile.exp ?? 0,
          level: profile.level ?? 1,
          total_activities: profile.total_activities ?? 0,
          total_hosted: profile.total_hosted ?? 0,
        }}
        avgRating={avg}
        activityCounts={activityCounts}
        occasionalStats={{
          completionist,
          samePersonRuns,
          anniversaryQuest,
          socialButterfly,
          hostAndPlayerMaster,
        }}
        isOwn
      />
      <form action={signOut} className="mt-8 text-center">
        <button
          type="submit"
          className="text-sm text-[var(--text-muted)] underline-offset-2 transition hover:text-[var(--gold-mid)] hover:underline"
        >
          {p.signOut}
        </button>
      </form>
    </div>
  );
}
