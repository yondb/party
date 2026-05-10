import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-bottom-main pt-nav-safe">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 sm:px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
