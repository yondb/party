import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { getServerLang } from "@/lib/i18n-server";
import { pageHeaderUi, premiumUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  const lang = getServerLang();
  const t = premiumUi(lang);
  const back = pageHeaderUi(lang);
  return (
    <div className="pb-6">
      <PageHeader title={t.title} backHref="/settings" backLabel={back.back} />
      <div className="wow-card mt-4 rounded-lg p-5">
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">{t.body}</p>
        <Link href="/settings" className="mt-6 inline-block text-sm text-[var(--gold-mid)] hover:text-[var(--gold-bright)]">
          {t.back}
        </Link>
      </div>
    </div>
  );
}
