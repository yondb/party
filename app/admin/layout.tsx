import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  if (!isAdminUser(user)) redirect("/feed");

  return (
    <div className="min-h-dvh bg-[var(--bg-deep)] px-4 pb-12 pt-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--gold-dim)] pb-4">
          <h1 className="font-display text-xl tracking-wide text-[var(--gold-bright)]">Admin console</h1>
          <Link
            href="/feed"
            className="font-display text-xs uppercase tracking-widest text-[var(--gold-mid)] hover:text-[var(--gold-bright)]"
          >
            Back to app
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
