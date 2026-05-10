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
        <section className="flex min-h-[72dvh] flex-col items-center justify-center px-5 text-center sm:px-6">
          <h1 className="font-display text-4xl font-black leading-tight text-[var(--gold-bright)] sm:text-5xl">
            FIND YOUR PARTY
          </h1>
          <p className="mt-4 max-w-md text-xl italic leading-snug text-[var(--text-secondary)] sm:text-2xl">
            Running. Coffee. Volleyball. Anything.
          </p>
          <p className="mt-6 text-base text-[var(--text-muted)] sm:text-lg">~ {activeCount} active players near you today</p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <Link
              href="/auth"
              className="btn-primary inline-flex min-h-[3rem] items-center justify-center rounded-md px-4 py-3 font-display text-base font-bold uppercase tracking-[0.1em]"
            >
              Join the adventure
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary inline-flex min-h-[3rem] items-center justify-center rounded-md px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.1em]"
            >
              Show me how it works
            </a>
          </div>
        </section>

        <section id="quests" className="mx-auto max-w-lg px-4 sm:px-5">
          <h2 className="font-display text-xl text-[var(--text-bright)] sm:text-2xl">Active quests nearby</h2>
          <hr className="divider-gold my-4" />
          <div className="space-y-4">
            {(slots ?? []).map((s) => {
              const act = getActivity(s.activity_type);
              return (
                <Link
                  key={s.id}
                  href="/auth"
                  className="block rounded-lg border border-[var(--gold-dim)] bg-[var(--bg-card)] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg text-[var(--text-bright)] sm:text-xl">{s.title}</p>
                      <p className="mt-1 text-sm leading-snug text-[var(--text-muted)] sm:text-base">
                        {new Date(s.date_time).toLocaleString()} · {s.location_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-2xl sm:text-3xl" title={act.label}>
                      {act.icon}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-mid)] sm:text-sm">
                    Sign in to apply
                  </p>
                </Link>
              );
            })}
            {!(slots?.length) ? (
              <p className="text-base text-[var(--text-muted)] sm:text-lg">
                No slots yet. Register and create the first one.
              </p>
            ) : null}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto mt-12 max-w-lg px-4 sm:px-5">
          <h2 className="font-display text-xl text-[var(--text-bright)] sm:text-2xl">How it works</h2>
          <hr className="divider-gold my-4" />
          <div className="grid gap-4">
            <div className="wow-card rounded-lg p-4 sm:p-5">
              <p className="font-display text-base font-bold text-[var(--gold-bright)] sm:text-lg">
                1. Create or join a quest
              </p>
              <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Open a slot with free spots, or apply to one created by someone nearby.
              </p>
            </div>
            <div className="wow-card rounded-lg p-4 sm:p-5">
              <p className="font-display text-base font-bold text-[var(--gold-bright)] sm:text-lg">
                2. Host builds the party
              </p>
              <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                The host reviews applicants and accepts the final party lineup.
              </p>
            </div>
            <div className="wow-card rounded-lg p-4 sm:p-5">
              <p className="font-display text-base font-bold text-[var(--gold-bright)] sm:text-lg">
                3. Complete activity and gain EXP
              </p>
              <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                After the activity, both sides rate each other and level up their profile.
              </p>
            </div>
          </div>
        </section>
      </div>
    </SplashGate>
  );
}
