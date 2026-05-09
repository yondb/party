import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-24 pt-14">
      <Navbar />
      <main className="mx-auto max-w-lg px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
