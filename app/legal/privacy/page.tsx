import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — lfparty",
  description: "How lfparty processes personal data (draft template).",
};

export default function PrivacyPage() {
  return (<article className="space-y-8 text-base leading-relaxed text-[var(--text-secondary)]">
      <header>
        <h1 className="text-3xl font-bold text-[var(--accent)]">Privacy policy</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Last updated: 2026-05-10 · Draft for review</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Who we are</h2>
        <p>
          lfparty is a social coordination app (&quot;Service&quot;) that helps you discover and join local
          activities (&quot;quests&quot;). The operator of the Service is the project owner identified in your
          deployment (e.g. hosting account). For GDPR purposes, that operator is typically the data controller.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Data we process</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account data: email (or phone if enabled), profile name, avatar, optional bio, gender, birth date.</li>
          <li>Activity data: quests you create or join, applications, messages in party chat, ratings.</li>
          <li>Technical data: IP address, device/browser type, cookies required for authentication and language.</li>
          <li>Location: approximate coordinates you submit when creating a quest or using map features.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Purposes and legal bases</h2>
        <p>
          We process data to provide the Service (contract), improve security and prevent abuse (legitimate interest),
          and comply with law. Marketing communications require separate consent where applicable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Retention</h2>
        <p>
          We keep data while your account is active and for a limited period afterwards for legal, security, and
          dispute-resolution purposes. Exact retention should be configured in your database and backup policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">5. Your rights (EEA/UK)</h2>
        <p>
          You may request access, rectification, erasure, restriction, portability, and object to processing where
          applicable. Contact the operator email you publish in the app. You may lodge a complaint with your
          supervisory authority.
        </p>
      </section>

      <p className="rounded border border-[var(--status-pending)]/50 bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]">
        This document is a starting template only — have it reviewed by qualified legal counsel before production use
        in the EU.
      </p>
    </article>
  );
}
