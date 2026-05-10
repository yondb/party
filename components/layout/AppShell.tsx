import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { shellMaxClass } from "@/lib/layout-shell";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-bottom-main pt-nav-safe">
      <Navbar />
      <main className={shellMaxClass}>{children}</main>
      <BottomNav />
    </div>
  );
}
