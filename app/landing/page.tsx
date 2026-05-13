import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActivity, normalizeActivityKey } from "@/lib/activities";
import { ActivityGlyph } from "@/components/activities/ActivityGlyph";
import { SplashGate } from "@/components/landing/SplashGate";
import { LandingTopBar } from "@/components/landing/LandingTopBar";
import { getServerLang } from "@/lib/i18n-server";
import { landingUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const lang = getServerLang();
  const t = landingUi(lang);
  const locale = lang === "pl" ? "pl-PL" : "en-GB";

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
      <LandingTopBar />
      <div className="min-h-dvh pb-10">
        <section className="flex min-h-[72dvh] flex-col items-center justify-center px-5 text-center sm:px-6">
          <h1 className="font-display text-4xl font-black leading-tight text-[var(--gold-bright)] sm:text-5xl">
            {t.hero}
          </h1>
          <p className="mt-4 max-w-md text-xl italic leading-snug text-[var(--text-secondary)] sm:text-2xl">
            {t.tagline}
          </p>
          <p className="mt-6 text-base text-[var(--text-muted)] sm:text-lg">
            ~ {activeCount} {t.activePlayers}
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <Link
              href="/auth"
              className="btn-primary inline-flex min-h-[3rem] items-center justify-center rounded-md px-4 py-3 font-display text-base font-bold uppercase tracking-[0.1em]"
            >
              {t.ctaJoin}
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary inline-flex min-h-[3rem] items-center justify-center rounded-md px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.1em]"
            >
              {t.ctaHow}
            </a>
          </div>
        </section>

        <section id="quests" className="mx-auto max-w-lg px-4 sm:px-5">
          <h2 className="font-display text-xl text-[var(--text-bright)] sm:text-2xl">{t.questsTitle}</h2>
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
                        {new Date(s.date_time).toLocaleString(locale, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {s.location_name}
                      </p>
                    </div>
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--gold-dim)] bg-[var(--bg-input)] sm:h-14 sm:w-14"
                      title={act.label}
                    >
                      <ActivityGlyph
                        activityKey={normalizeActivityKey(s.activity_type)}
                        size={30}
                        className="text-[var(--gold-bright)]"
                      />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-mid)] sm:text-sm">
                    {t.signInToApply}
                  </p>
                </Link>
              );
            })}
            {!(slots?.length) ? (
              <p className="text-base text-[var(--text-muted)] sm:text-lg">{t.noSlots}</p>
            ) : null}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto mt-12 max-w-lg px-4 sm:px-5">
          <h2 className="font-display text-xl text-[var(--text-bright)] sm:text-2xl">{t.howTitle}</h2>
          <hr className="divider-gold my-4" />
          <div className="grid gap-4">
            <div className="wow-card rounded-lg p-4 sm:p-5">
              <p className="font-display text-base font-bold text-[var(--gold-bright)] sm:text-lg">{t.step1Title}</p>
              <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">{t.step1Body}</p>
            </div>
            <div className="wow-card rounded-lg p-4 sm:p-5">
              <p className="font-display text-base font-bold text-[var(--gold-bright)] sm:text-lg">{t.step2Title}</p>
              <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">{t.step2Body}</p>
            </div>
            <div className="wow-card rounded-lg p-4 sm:p-5">
              <p className="font-display text-base font-bold text-[var(--gold-bright)] sm:text-lg">{t.step3Title}</p>
              <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">{t.step3Body}</p>
            </div>
          </div>
        </section>

        <footer className="mx-auto mt-16 max-w-lg px-4 pb-8 text-center sm:px-5">
          <hr className="divider-gold mb-6" />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            <Link href="/legal/privacy" className="hover:text-[var(--gold-mid)]">
              {t.privacy}
            </Link>
            <Link href="/legal/terms" className="hover:text-[var(--gold-mid)]">
              {t.terms}
            </Link>
          </nav>
        </footer>
      </div>
    </SplashGate>
  );
}
