import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { pageHeaderUi, settingsUi } from "@/lib/i18n-ui";
import { SettingsAccountPanel } from "@/components/settings/SettingsAccountPanel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = settingsUi();
  const back = pageHeaderUi();

  const prefs = (user?.user_metadata?.preferred_activities as string[] | undefined) ?? [];
  const emailOn = user?.user_metadata?.notify_email_transactional !== false;
  const marketing = user?.user_metadata?.marketing_opt_in === true;

  return (<div className="pb-6">
      <PageHeader title={t.title} backHref="/profile" backLabel={back.back} />
      <div className="floating-card rounded-lg p-4">
        <h2 className="text-xs font-medium text-[var(--text-secondary)]">
          {t.accountHeading}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t.accountBody}</p>
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          {t.prefsLabel} {prefs.length ? prefs.join(", ") : t.prefsNone}
        </p>
      </div>
      <SettingsAccountPanel initialEmailTransactional={emailOn} initialMarketing={marketing} />
    </div>
  );
}
