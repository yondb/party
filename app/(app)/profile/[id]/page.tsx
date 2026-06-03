import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileFixIt } from "../ProfileFixIt";
import { ReportProfileDialog } from "@/components/profile/ReportProfileDialog";
import { normalizeActivityKey, type ActivityKey } from "@/lib/activities";
import {
  getLevelFromExp,
  getNextLevelRow,
  getExpToNextLevel,
  getLevelProgress,
} from "@/lib/exp";

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
    "dog_walk",
    "yoga",
    "movies",
  ];
  const completionist = completionKeys.every((k) => (activityCounts[k] ?? 0) > 0);

  const isOwn = user?.id === profile.id;

  const reliabilityPct = Math.round((profile.reliability_score ?? 1) * 100);
  const xp = profile.exp ?? 0;
  const levelRow = getLevelFromExp(xp);
  const nextLevelName = getNextLevelRow(xp)?.title ?? null;
  const expToNext = getExpToNextLevel(xp);
  const progressPct = Math.round(getLevelProgress(xp) * 100);
  const homeCity = (profile as { home_city?: string }).home_city?.trim();

  const badges = [
    { id: "first-host", name: "Pierwszy host", earned: (profile.total_hosted ?? 0) >= 1, icon: "trophy" as const },
    { id: "reliable", name: "Niezawodny", earned: reliabilityPct >= 90, icon: "shield" as const },
    { id: "streak", name: "5 z rzędu", earned: samePersonRuns >= 5, icon: "zap" as const },
    { id: "social", name: "Społecznik", earned: socialButterfly, icon: "award" as const },
    { id: "explorer", name: "Odkrywca", earned: completionist, icon: "award" as const },
    { id: "morning", name: "Ranny ptaszek", earned: false, icon: "award" as const },
  ];

  return (
    <ProfileFixIt
      name={profile.name}
      gender={profile.gender === "male" ? "M" : "F"}
      level={levelRow.level}
      levelName={levelRow.title}
      xp={xp}
      progressPct={progressPct}
      expToNext={expToNext}
      nextLevelName={nextLevelName}
      reliability={reliabilityPct}
      stats={{
        events: profile.total_activities ?? 0,
        hosted: profile.total_hosted ?? 0,
        rating: avg != null ? avg.toFixed(1) : null,
      }}
      city={homeCity || "Austin"}
      bio={profile.bio}
      badges={badges}
      isOwn={isOwn}
      backHref="/feed"
      actionSlot={user && !isOwn ? <ReportProfileDialog reportedUserId={profile.id} /> : null}
    />
  );
}

