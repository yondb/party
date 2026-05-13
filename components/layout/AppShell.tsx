import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { AppFooter } from "./AppFooter";
import { shellMaxClass } from "@/lib/layout-shell";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-bottom-main pt-nav-safe">
      <Navbar />
      <main className={shellMaxClass}>
        {children}
        <AppFooter />
      </main>
      <BottomNav />
    </div>
  );
}
