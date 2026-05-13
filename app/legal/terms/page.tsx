import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — PartyFinder",
  description: "Terms of use for PartyFinder (draft template).",
};

export default function TermsPage() {
  return (
    <article className="space-y-8 text-base leading-relaxed text-[var(--text-secondary)]">
      <header>
        <h1 className="font-display text-3xl text-[var(--gold-bright)]">Terms of use</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Last updated: 2026-05-10 · Draft for review</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-[var(--text-bright)]">1. The Service</h2>
        <p>
          PartyFinder connects people for real-world activities. We do not guarantee participant behaviour, safety of
          locations, or outcomes of meetups. You participate at your own risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-[var(--text-bright)]">2. Accounts and conduct</h2>
        <p>
          You must provide accurate information and keep credentials secure. Harassment, hate, illegal activity, or
          abuse of reporting tools may result in suspension or termination. Moderators may restrict accounts where
          necessary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-[var(--text-bright)]">3. Content</h2>
        <p>
          You retain rights to content you post. You grant the Service a licence to host, display, and distribute that
          content as needed to operate PartyFinder.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-[var(--text-bright)]">4. Disclaimer</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by
          law, we are not liable for indirect damages or losses arising from meetups between users.
        </p>
      </section>

      <hr className="divider-gold my-8" />

      <header>
        <h2 className="font-display text-2xl text-[var(--gold-bright)]">Regulamin (PL)</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Szkic do akceptacji prawnika · 2026-05-10</p>
      </header>

      <section className="space-y-3">
        <h3 className="font-display text-lg text-[var(--text-bright)]">1. Usługa</h3>
        <p>
          Aplikacja umożliwia organizowanie i dołączanie do aktywności offline. Operator nie odpowiada za przebieg
          spotkań ani zachowanie uczestników — bierzesz w nich udział na własną odpowiedzialność.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg text-[var(--text-bright)]">2. Zasady</h3>
        <p>
          Zakazane jest m.in. nękanie, treści bezprawne, spam oraz nadużywanie zgłoszeń. Konto może zostać zablokowane
          po decyzji moderatora.
        </p>
      </section>

      <p className="rounded border border-[var(--status-pending)]/50 bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]">
        Szablon informacyjny — przed uruchomieniem komercyjnym skonsultuj z kancelarią.
      </p>
    </article>
  );
}
