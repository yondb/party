import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavbarClient } from "@/components/layout/NavbarClient";
import { isAdminUser } from "@/lib/admin";
import { shellMaxClass } from "@/lib/layout-shell";

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unread = 0;
  if (user) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    unread = count ?? 0;
  }

  const showAdmin = user != null && isAdminUser(user);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--gold-dim)] bg-[var(--bg-void)]/95 pt-safe backdrop-blur-sm">
      <div
        className={`${shellMaxClass} flex min-h-[3.25rem] flex-col gap-2 py-2 sm:min-h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2`}
      >
        <Link
          href="/"
          className="animate-brand-soft shrink-0 whitespace-nowrap font-display text-lg font-bold tracking-wide text-[var(--gold-bright)] sm:text-xl md:text-2xl"
          style={{ textShadow: "0 0 12px rgba(240,192,64,0.25)" }}
        >
          PartyFinder
        </Link>
        <NavbarClient unread={unread} showAdmin={showAdmin} />
      </div>
    </header>
  );
}
