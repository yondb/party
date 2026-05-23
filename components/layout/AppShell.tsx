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
    <div className="min-h-dvh bg-[var(--bg-page)] pb-bottom-main pt-nav-safe">
      <Navbar />
      <main className="w-full">
        {!isGuest ? (
          <div className="page-shell">
            <PendingRatingsBanner items={pendingRatings} />
          </div>
        ) : null}
        {children}
        <div className="page-shell">
          <AppFooter />
        </div>
      </main>
      <BottomNav isGuest={isGuest} />
    </div>
  );
}
