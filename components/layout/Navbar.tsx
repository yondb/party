import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavbarClient } from "@/components/layout/NavbarClient";
import { isAdminUser } from "@/lib/admin";

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
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--gold-dim)] bg-[var(--bg-void)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-wide text-[var(--gold-bright)]"
          style={{ textShadow: "0 0 12px rgba(240,192,64,0.25)" }}
        >
          PartyFinder
        </Link>
        <NavbarClient unread={unread} showAdmin={showAdmin} />
      </div>
    </header>
  );
}
