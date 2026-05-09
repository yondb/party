import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

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

    recentSlots = (slotsRes.data ?? []) as SlotRow[];
    recentApps = (appsRes.data ?? []) as AppRow[];

    const hostIds = Array.from(new Set(recentSlots.map((s) => s.host_id)));
    const applicantIds = Array.from(new Set(recentApps.map((a) => a.applicant_id)));
    const userIds = Array.from(new Set([...hostIds, ...applicantIds]));

    if (userIds.length) {
      const { data: users, error: usersErr } = await admin.from("users").select("id, name").in("id", userIds);
      if (usersErr) throw new Error(usersErr.message);
      users?.forEach((row) => userNames.set(row.id, row.name));
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load admin metrics";
  }

  if (error) {
    return (
      <div className="wow-card rounded-lg p-6 text-[var(--status-full)]">
        <p className="font-display text-sm uppercase tracking-widest">Admin data error</p>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Check that <code className="text-[var(--gold-mid)]">SUPABASE_SERVICE_ROLE_KEY</code> is set on the server
          (Vercel env).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-xs uppercase tracking-widest text-[var(--text-muted)]">Overview</h2>
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
        <h2 className="mb-3 font-display text-xs uppercase tracking-widest text-[var(--text-muted)]">
          Latest slots
        </h2>
        <ul className="space-y-2 text-sm">
          {recentSlots.length === 0 ? (
            <li className="text-[var(--text-muted)]">No slots yet.</li>
          ) : (
            recentSlots.map((s) => (
              <li key={s.id} className="wow-card rounded-md px-3 py-2">
                <span className="font-display text-[var(--text-bright)]">{s.title}</span>
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
        <h2 className="mb-3 font-display text-xs uppercase tracking-widest text-[var(--text-muted)]">
          Latest applications
        </h2>
        <ul className="space-y-2 text-sm">
          {recentApps.length === 0 ? (
            <li className="text-[var(--text-muted)]">No applications yet.</li>
          ) : (
            recentApps.map((a) => (
              <li key={a.id} className="wow-card rounded-md px-3 py-2">
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
  return (
    <div className="wow-card rounded-md px-3 py-2">
      <p className="font-display text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-xl text-[var(--gold-bright)]">{value}</p>
    </div>
  );
}
