import { createClient } from "@/lib/supabase/server";
import { NavbarClient } from "@/components/layout/NavbarClient";
import { Logo } from "@/components/ui/Logo";
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
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 pt-safe">
      <div className="pointer-events-auto mx-auto mt-2 flex h-14 max-w-lg items-center justify-between rounded-full border-b border-ash-200/60 bg-surface/80 px-4 backdrop-blur-md lg:max-w-none lg:rounded-none lg:border lg:shadow-none">
        <Logo size="sm" href={user ? "/map" : "/map"} />
        <NavbarClient unread={unread} showAdmin={showAdmin} isGuest={!user} />
      </div>
    </header>
  );
}
