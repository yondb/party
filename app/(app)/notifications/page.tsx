import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/Button";
import { notificationsUi, pageHeaderUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const t = notificationsUi();
  const back = pageHeaderUi();

  const { data: rows } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const locale = "en-US";

  return (<div className="pb-6">
      <PageHeader title={t.title} backHref="/feed" backLabel={back.back} />
      {(rows?.length ?? 0) > 0 ? (<form action={markAllNotificationsRead} className="mb-4">
          <Button type="submit" variant="secondary" fullWidth>
            {t.markAll}
          </Button>
        </form>
      ) : null}

      {!rows?.length ? (<div className="floating-card rounded-lg p-8 text-center text-sm text-[var(--text-muted)]">{t.empty}</div>
      ) : (<ul className="flex flex-col gap-3">
          {rows.map((n) => (<li
              key={n.id}
              className={`floating-card rounded-lg p-4 transition ${
                n.read ? "opacity-60" : "border-l-2 border-l-[var(--accent)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                    {!n.read ? (<span className="size-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                    ) : null}
                    {n.title}
                  </p>
                  {n.body ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{n.body}</p> : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {new Date(n.created_at).toLocaleString(locale)}
                  </p>
                  {n.slot_id ? (<Link
                      href={n.type === "rate_slot" ? `/slots/${n.slot_id}/rate` : `/slots/${n.slot_id}`}
                      className="mt-2 inline-block text-sm text-[var(--accent)]"
                    >
                      {n.type === "rate_slot" ? t.rateSlot : t.openSlot}
                    </Link>
                  ) : null}
                </div>
                {!n.read ? (<form action={markNotificationRead.bind(null, n.id)}>
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
