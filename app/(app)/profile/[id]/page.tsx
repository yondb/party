import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ReportProfileDialog } from "@/components/profile/ReportProfileDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { normalizeActivityKey, type ActivityKey } from "@/lib/activities";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("users").select("*").eq("id", id).single();
  if (!profile) notFound();

  const { data: apps } = await supabase
    .from("applications")
    .select("slot_id, status")
    .eq("applicant_id", profile.id)
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
    .eq("rated_id", profile.id);

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

  const isOwn = user?.id === profile.id;

  return (
    <div className="page-shell pb-bottom-main pt-nav-safe">
      <PageHeader title={profile.name} backHref="/feed" />
      {isOwn ? (
        <Link href="/profile/edit" className="mb-4 block text-sm text-[var(--accent)]">
          Edit profile
        </Link>
      ) : user ? (
        <ReportProfileDialog reportedUserId={profile.id} />
      ) : null}
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
      />
    </div>
  );
}

