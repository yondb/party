import {
  banReportFormAction,
  dismissReportFormAction,
  unbanUserFormAction,
} from "@/app/actions/admin-moderation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

type ProfileReportRow = {
  id: string;
  reported_user_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
};

type SlotRow = {
  id: string;
  title: string;
  status: string;
  activity_type: string;
  date_time: string;
  created_at: string;
  host_id: string;
};

type AppRow = {
  id: string;
  slot_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
};

export default async function AdminDashboardPage() {
  let error: string | null = null;
  let usersTotal = 0;
  let slotsOpen = 0;
  let slotsFull = 0;
  let slotsCompleted = 0;
  let slotsCancelled = 0;
  let appsPending = 0;
  let appsAccepted = 0;
  let appsRejected = 0;
  let notifUnread = 0;
  let recentSlots: SlotRow[] = [];
  let recentApps: AppRow[] = [];
  let pendingReports: ProfileReportRow[] = [];
  const userNames = new Map<string, string>();

  try {
    const admin = createServiceRoleClient();

    const [
      u,
      sOpen,
      sFull,
      sDone,
      sCancelled,
      aPending,
      aAccepted,
      aRejected,
      nUnread,
      slotsRes,
      appsRes,
      reportsRes,
    ] = await Promise.all([
      admin.from("users").select("id", { count: "exact", head: true }),
      admin.from("slots").select("id", { count: "exact", head: true }).eq("status", "open"),
      admin.from("slots").select("id", { count: "exact", head: true }).eq("status", "full"),
      admin.from("slots").select("id", { count: "exact", head: true }).eq("status", "completed"),
      admin.from("slots").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
      admin.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("applications").select("id", { count: "exact", head: true }).eq("status", "accepted"),
      admin.from("applications").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      admin.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
      admin
        .from("slots")
        .select("id, title, status, activity_type, date_time, created_at, host_id")
        .order("created_at", { ascending: false })
        .limit(12),
      admin
        .from("applications")
        .select("id, slot_id, applicant_id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      admin
        .from("profile_reports")
        .select("id, reported_user_id, reporter_id, reason, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    usersTotal = u.count ?? 0;
    slotsOpen = sOpen.count ?? 0;
    slotsFull = sFull.count ?? 0;
    slotsCompleted = sDone.count ?? 0;
    slotsCancelled = sCancelled.count ?? 0;
    appsPending = aPending.count ?? 0;
    appsAccepted = aAccepted.count ?? 0;
    appsRejected = aRejected.count ?? 0;
    notifUnread = nUnread.count ?? 0;

    if (slotsRes.error) throw new Error(slotsRes.error.message);
    if (appsRes.error) throw new Error(appsRes.error.message);
    if (reportsRes.error) throw new Error(reportsRes.error.message);

    recentSlots = (slotsRes.data ?? []) as SlotRow[];
    recentApps = (appsRes.data ?? []) as AppRow[];
    pendingReports = (reportsRes.data ?? []) as ProfileReportRow[];

    const hostIds = Array.from(new Set(recentSlots.map((s) => s.host_id)));
    const applicantIds = Array.from(new Set(recentApps.map((a) => a.applicant_id)));
    const reportUserIds = pendingReports.flatMap((r) => [r.reported_user_id, r.reporter_id]);
    const userIds = Array.from(new Set([...hostIds, ...applicantIds, ...reportUserIds]));

    if (userIds.length) {
      const { data: users, error: usersErr } = await admin.from("users").select("id, name").in("id", userIds);
      if (usersErr) throw new Error(usersErr.message);
      users?.forEach((row) => userNames.set(row.id, row.name));
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load admin metrics";
  }

  if (error) {
    return (<div className="floating-card rounded-lg p-6 text-[var(--status-full)]">
        <p className="text-xs font-medium">Admin data error</p>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Check that <code className="text-[var(--accent)]">SUPABASE_SERVICE_ROLE_KEY</code> is set on the server
          (Vercel env).
        </p>
      </div>
    );
  }

  return (<div className="space-y-8">
      <section>
        <h2 className="mb-3 text-xs font-medium text-[var(--text-muted)]">Overview</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Users" value={usersTotal} />
          <Stat label="Slots open" value={slotsOpen} />
          <Stat label="Slots full" value={slotsFull} />
          <Stat label="Slots done" value={slotsCompleted} />
          <Stat label="Slots cancelled" value={slotsCancelled} />
          <Stat label="Apps pending" value={appsPending} />
          <Stat label="Apps accepted" value={appsAccepted} />
          <Stat label="Apps rejected" value={appsRejected} />
          <Stat label="Notif. unread" value={notifUnread} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium text-[var(--text-muted)]">
          Profile reports (pending)
        </h2>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          Manual queue: read the reason, then dismiss the report or ban the reported account (Auth + app block).
        </p>
        <ul className="space-y-3 text-sm">
          {pendingReports.length === 0 ? (<li className="text-[var(--text-muted)]">No pending reports.</li>
          ) : (pendingReports.map((r) => (<li key={r.id} className="floating-card rounded-md px-3 py-3">
                <p className="text-[var(--text-primary)]">
                  <span className="text-[var(--text-muted)]">Reported:</span>{" "}
                  {userNames.get(r.reported_user_id) ?? r.reported_user_id}
                </p>
                <p className="mt-1">
                  <span className="text-[var(--text-muted)]">Reporter:</span>{" "}
                  {userNames.get(r.reporter_id) ?? r.reporter_id}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[var(--text-secondary)]">{r.reason}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{new Date(r.created_at).toLocaleString()}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={dismissReportFormAction}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <button
                      type="submit"
                      className="btn-secondary inline-flex min-h-[2.5rem] items-center justify-center rounded-md px-3 py-2 text-xs font-medium"
                    >
                      Dismiss
                    </button>
                  </form>
                  <form action={banReportFormAction}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="reportedUserId" value={r.reported_user_id} />
                    <button
                      type="submit"
                      className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-[var(--status-full)] bg-transparent px-3 py-2 text-xs font-medium text-[var(--status-full)] hover:bg-[var(--status-full)]/10"
                    >
                      Ban user
                    </button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium text-[var(--text-muted)]">Unban user</h2>
        <p className="mb-2 text-sm text-[var(--text-secondary)]">
          Paste the user UUID (from Supabase or the report row). Clears DB flag and Auth ban.
        </p>
        <form action={unbanUserFormAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            name="userId"
            placeholder="User UUID"
            className="min-h-[2.75rem] flex-1 rounded-md border border-[var(--border-medium)] bg-[var(--bg-input)] px-3 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <button
            type="submit"
            className="btn-secondary inline-flex min-h-[2.75rem] shrink-0 items-center justify-center rounded-md px-4 py-2 text-xs font-medium"
          >
            Unban
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium text-[var(--text-muted)]">
          Latest slots
        </h2>
        <ul className="space-y-2 text-sm">
          {recentSlots.length === 0 ? (<li className="text-[var(--text-muted)]">No slots yet.</li>
          ) : (recentSlots.map((s) => (<li key={s.id} className="floating-card rounded-md px-3 py-2">
                <span className="font-semibold text-[var(--text-primary)]">{s.title}</span>
                <span className="mx-2 text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-secondary)]">{s.activity_type}</span>
                <span className="mx-2 text-[var(--text-muted)]">·</span>
                <span className="text-[var(--status-pending)]">{s.status}</span>
                <br />
                <span className="text-xs text-[var(--text-muted)]">
                  Host: {userNames.get(s.host_id) ?? s.host_id} · {new Date(s.date_time).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium text-[var(--text-muted)]">
          Latest applications
        </h2>
        <ul className="space-y-2 text-sm">
          {recentApps.length === 0 ? (<li className="text-[var(--text-muted)]">No applications yet.</li>
          ) : (recentApps.map((a) => (<li key={a.id} className="floating-card rounded-md px-3 py-2">
                <span className="text-[var(--text-secondary)]">{userNames.get(a.applicant_id) ?? a.applicant_id}</span>
                <span className="mx-2 text-[var(--text-muted)]">→</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">{a.slot_id.slice(0, 8)}…</span>
                <span className="mx-2 text-[var(--text-muted)]">·</span>
                <span
                  className={
                    a.status === "accepted"
                      ? "text-[var(--status-open)]"
                      : a.status === "rejected"
                        ? "text-[var(--status-full)]"
                        : "text-[var(--status-pending)]"
                  }
                >
                  {a.status}
                </span>
                <span className="ml-2 text-xs text-[var(--text-muted)]">{new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (<div className="floating-card rounded-md px-3 py-2">
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[var(--accent)]">{value}</p>
    </div>
  );
}
