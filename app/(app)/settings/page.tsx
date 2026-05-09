import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prefs = (user?.user_metadata?.preferred_activities as string[] | undefined) ?? [];

  return (
    <div className="pb-6">
      <PageHeader title="Settings" />
      <div className="wow-card rounded-lg p-4">
        <h2 className="font-display text-sm uppercase tracking-widest text-[var(--text-secondary)]">Account and privacy</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Push notification toggles and advanced privacy are in the next iteration.</p>
        <p className="mt-4 text-xs text-[var(--text-muted)]">Preferred activities: {prefs.length ? prefs.join(", ") : "none"}</p>
      </div>
    </div>
  );
}
