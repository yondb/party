import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { runSlotLifecycle } from "@/lib/slot-lifecycle";
import { getPendingRatingSlots } from "@/lib/pending-ratings";

export const dynamic = "force-dynamic";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pendingRatings: Awaited<ReturnType<typeof getPendingRatingSlots>> = [];
  if (user) {
    await runSlotLifecycle(supabase);
    pendingRatings = await getPendingRatingSlots(supabase, user.id);
  }

  return <AppShell pendingRatings={pendingRatings}>{children}</AppShell>;
}
