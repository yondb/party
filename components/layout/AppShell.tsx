import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { AppFooter } from "./AppFooter";
import { PendingRatingsBanner } from "@/components/profile/PendingRatingsBanner";
import type { PendingRatingSlot } from "@/lib/pending-ratings";

export async function AppShell({
  children,
  pendingRatings = [],
  isGuest = false,
}: {
  children: React.ReactNode;
  pendingRatings?: PendingRatingSlot[];
  isGuest?: boolean;
}) {
  return (
    <div className="min-h-dvh pb-bottom-main pt-nav-safe">
      <Navbar />
      <main className="w-full px-4 sm:px-6 lg:px-10">
        {!isGuest ? <PendingRatingsBanner items={pendingRatings} /> : null}
        {children}
        <AppFooter />
      </main>
      <BottomNav isGuest={isGuest} />
    </div>
  );
}
