import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/Button";
import { getServerLang } from "@/lib/i18n-server";
import { notificationsUi, pageHeaderUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const lang = getServerLang();
  const t = notificationsUi(lang);
  const back = pageHeaderUi(lang);

  const { data: rows } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const locale = lang === "pl" ? "pl-PL" : "en-GB";

  return (
    <div className="pb-6">
      <PageHeader title={t.title} backHref="/feed" backLabel={back.back} />
      {(rows?.length ?? 0) > 0 ? (
        <form action={markAllNotificationsRead} className="mb-4">
          <Button type="submit" variant="secondary" fullWidth>
            {t.markAll}
          </Button>
        </form>
      ) : null}

      {!rows?.length ? (
        <div className="wow-card rounded-lg p-8 text-center text-sm text-[var(--text-muted)]">{t.empty}</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((n) => (
            <li key={n.id} className="wow-card rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[var(--text-bright)]">{n.title}</p>
                  {n.body ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{n.body}</p> : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {new Date(n.created_at).toLocaleString(locale)}
                  </p>
                  {n.slot_id ? (
                    <Link href={`/slots/${n.slot_id}`} className="mt-2 inline-block text-sm text-[var(--gold-mid)]">
                      {t.openSlot}
                    </Link>
                  ) : null}
                </div>
                {!n.read ? (
                  <form action={markNotificationRead.bind(null, n.id)}>
                    <Button type="submit" variant="secondary" className="!px-2 !py-1 text-[10px]">
                      {t.ok}
                    </Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
