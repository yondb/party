import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { signOut } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import type { ActivityKey } from "@/lib/activities";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage() {
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
    const k = s.activity_type as ActivityKey;
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
    <div className="pb-6">
      <PageHeader
        title="Profile"
        right={
          <Link
            href="/profile/edit"
            className="font-display text-xs uppercase tracking-widest text-[var(--gold-mid)]"
          >
            Edit
          </Link>
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
      <form className="mt-6" action={signOut}>
        <Button type="submit" variant="secondary" fullWidth>
          Sign out
        </Button>
      </form>
    </div>
  );
}
