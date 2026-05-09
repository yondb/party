import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="pb-6">
      <PageHeader title="Notifications" />
      {(rows?.length ?? 0) > 0 ? (
        <form action={markAllNotificationsRead} className="mb-4">
          <Button type="submit" variant="secondary" fullWidth>
            Mark all as read
          </Button>
        </form>
      ) : null}

      {!rows?.length ? (
        <div className="wow-card rounded-lg p-8 text-center text-sm text-[var(--text-muted)]">
          No notifications yet. New applications, approvals, chat mentions, and rating reminders will appear here.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((n) => (
            <li key={n.id} className="wow-card rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[var(--text-bright)]">{n.title}</p>
                  {n.body ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{n.body}</p> : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                  {n.slot_id ? (
                    <Link href={`/slots/${n.slot_id}`} className="mt-2 inline-block text-sm text-[var(--gold-mid)]">
                      Open slot
                    </Link>
                  ) : null}
                </div>
                {!n.read ? (
                  <form action={markNotificationRead.bind(null, n.id)}>
                    <Button type="submit" variant="secondary" className="!px-2 !py-1 text-[10px]">
                      OK
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
