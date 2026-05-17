import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { AppFooter } from "./AppFooter";
import { shellMaxClass } from "@/lib/layout-shell";
import { PendingRatingsBanner } from "@/components/profile/PendingRatingsBanner";
import type { PendingRatingSlot } from "@/lib/pending-ratings";

export async function AppShell({
  children,
  pendingRatings = [],
}: {
  children: React.ReactNode;
  pendingRatings?: PendingRatingSlot[];
}) {
  return (
    <div className="min-h-dvh pb-bottom-main pt-nav-safe">
      <Navbar />
      <main className={shellMaxClass}>
        <PendingRatingsBanner items={pendingRatings} />
        {children}
        <AppFooter />
      </main>
      <BottomNav />
    </div>
  );
}
