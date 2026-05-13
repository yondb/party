import Link from "next/link";
import { getServerLang } from "@/lib/i18n-server";
import { appFooterUi } from "@/lib/i18n-ui";

const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@partyfinder.local";

export async function AppFooter() {
  const lang = getServerLang();
  const t = appFooterUi(lang);
  return (
    <footer className="mt-8 border-t border-[var(--gold-dim)]/60 px-4 py-6 text-center">
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-display text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
        <Link href="/legal/privacy" className="hover:text-[var(--gold-mid)]">
          {t.legalPrivacy}
        </Link>
        <Link href="/legal/terms" className="hover:text-[var(--gold-mid)]">
          {t.legalTerms}
        </Link>
        <a href={`mailto:${SUPPORT}`} className="hover:text-[var(--gold-mid)]">
          {t.support}
        </a>
      </nav>
    </footer>
  );
}
