import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  if (!isAdminUser(user)) redirect("/feed");

  return (
    <div className="min-h-dvh bg-[var(--bg-page)] px-4 pb-12 pt-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--border-medium)] pb-4">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin console</h1>
          <Link
            href="/feed"
            className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Back to app
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
