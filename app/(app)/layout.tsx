import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PendingRatingsBanner } from "@/components/profile/PendingRatingsBanner";
import { runSlotLifecycle } from "@/lib/slot-lifecycle";
import { getPendingRatingSlots } from "@/lib/pending-ratings";

export const dynamic = "force-dynamic";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pendingRatings: Awaited<ReturnType<typeof getPendingRatingSlots>> = [];
  let userName: string | undefined;
  let userLevel: number | undefined;
  let avatarUrl: string | null | undefined;

  if (user) {
    await runSlotLifecycle(supabase);
    pendingRatings = await getPendingRatingSlots(supabase, user.id);
    const { data: profile } = await supabase
      .from("users")
      .select("name, level, avatar_url")
      .eq("id", user.id)
      .single();
    userName = profile?.name ?? undefined;
    userLevel = profile?.level ?? undefined;
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <AppShell isGuest={!user} userName={userName} userLevel={userLevel} avatarUrl={avatarUrl}>
      {!user || pendingRatings.length === 0 ? null : (
        <div className="mx-auto max-w-5xl px-4 lg:px-8 pt-4">
          <PendingRatingsBanner items={pendingRatings} />
        </div>
      )}
      {children}
    </AppShell>
  );
}
