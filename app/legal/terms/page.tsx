import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — lfparty",
  description: "Terms of use for lfparty (draft template).",
};

export default function TermsPage() {
  return (<article className="space-y-8 text-base leading-relaxed text-[var(--text-secondary)]">
      <header>
        <h1 className="text-3xl font-bold text-[var(--accent)]">Terms of use</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Last updated: 2026-05-10 · Draft for review</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. The Service</h2>
        <p>
          lfparty connects people for real-world activities. We do not guarantee participant behaviour, safety of
          locations, or outcomes of meetups. You participate at your own risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Accounts and conduct</h2>
        <p>
          You must provide accurate information and keep credentials secure. Harassment, hate, illegal activity, or
          abuse of reporting tools may result in suspension or termination. Moderators may restrict accounts where
          necessary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Content</h2>
        <p>
          You retain rights to content you post. You grant the Service a licence to host, display, and distribute that
          content as needed to operate lfparty.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Disclaimer</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by
          law, we are not liable for indirect damages or losses arising from meetups between users.
        </p>
      </section>

      <p className="rounded border border-[var(--status-pending)]/50 bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]">
        This document is a starting template only — have it reviewed by qualified legal counsel before production use.
      </p>
    </article>
  );
}
