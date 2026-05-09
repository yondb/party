import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActivity } from "@/lib/activities";
import { SplashGate } from "@/components/landing/SplashGate";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const supabase = createClient();
  const { data: slots } = await supabase
    .from("slots")
    .select("id, title, activity_type, date_time, location_name")
    .eq("status", "open")
    .order("date_time", { ascending: true })
    .limit(4);

  const activeCount = (slots?.length ?? 0) * 7 + 12;

  return (
    <SplashGate>
      <div className="min-h-dvh pb-10">
        <section className="flex min-h-[72dvh] flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-4xl font-black text-[var(--gold-bright)]">FIND YOUR PARTY</h1>
          <p className="mt-3 max-w-sm text-lg italic text-[var(--text-secondary)]">Running. Coffee. Volleyball. Anything.</p>
          <p className="mt-5 text-sm text-[var(--text-muted)]">~ {activeCount} active players near you today</p>
          <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
            <Link href="/auth" className="btn-primary inline-flex min-h-[2.75rem] items-center justify-center rounded-md px-4 py-2 font-display text-sm uppercase tracking-widest">Join the adventure</Link>
            <a href="#how-it-works" className="btn-secondary inline-flex min-h-[2.75rem] items-center justify-center rounded-md px-4 py-2 font-display text-sm uppercase tracking-widest">Show me how it works</a>
          </div>
        </section>

        <section id="quests" className="mx-auto max-w-lg px-4">
          <h2 className="font-display text-lg text-[var(--text-bright)]">Active quests nearby</h2>
          <hr className="divider-gold my-3" />
          <div className="space-y-3">
            {(slots ?? []).map((s) => {
              const act = getActivity(s.activity_type);
              return (
                <Link key={s.id} href="/auth" className="block rounded-lg border border-[var(--gold-dim)] bg-[var(--bg-card)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-[var(--text-bright)]">{s.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(s.date_time).toLocaleString()} · {s.location_name}</p>
                    </div>
                    <span className="text-xl" title={act.label}>{act.icon}</span>
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-widest text-[var(--gold-mid)]">Sign in to apply</p>
                </Link>
              );
            })}
            {!(slots?.length) ? <p className="text-sm text-[var(--text-muted)]">No slots yet. Register and create the first one.</p> : null}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto mt-10 max-w-lg px-4">
          <h2 className="font-display text-lg text-[var(--text-bright)]">How it works</h2>
          <hr className="divider-gold my-3" />
          <div className="grid gap-3">
            <div className="wow-card rounded-lg p-3">
              <p className="font-display text-sm text-[var(--gold-bright)]">1. Create or join a quest</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Open a slot with free spots, or apply to one created by someone nearby.</p>
            </div>
            <div className="wow-card rounded-lg p-3">
              <p className="font-display text-sm text-[var(--gold-bright)]">2. Host builds the party</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">The host reviews applicants and accepts the final party lineup.</p>
            </div>
            <div className="wow-card rounded-lg p-3">
              <p className="font-display text-sm text-[var(--gold-bright)]">3. Complete activity and gain EXP</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">After the activity, both sides rate each other and level up their profile.</p>
            </div>
          </div>
        </section>
      </div>
    </SplashGate>
  );
}
