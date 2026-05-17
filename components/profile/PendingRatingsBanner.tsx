import Link from "next/link";
import type { PendingRatingSlot } from "@/lib/pending-ratings";
import { getServerLang } from "@/lib/i18n-server";
import { pendingRatingsUi } from "@/lib/i18n-ui";

export function PendingRatingsBanner({ items }: { items: PendingRatingSlot[] }) {
  if (items.length === 0) return null;
  const lang = getServerLang();
  const t = pendingRatingsUi(lang);
  const first = items[0];

  return (
    <div className="mb-4 rounded-lg border border-[var(--gold-bright)]/50 bg-[linear-gradient(180deg,rgba(201,150,58,0.12),rgba(20,17,12,0.9))] p-4">
      <p className="font-display text-sm font-semibold text-[var(--gold-bright)]">{t.title}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {items.length === 1
          ? t.oneSlot(first.title, first.pendingCount)
          : t.manySlots(items.length)}
      </p>
      <Link
        href={first.rateHref}
        className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-[var(--gold-bright)] bg-[linear-gradient(180deg,#c9963a,#8a6420)] px-4 font-display text-xs font-bold uppercase tracking-wide text-[var(--bg-void)]"
      >
        {t.cta}
      </Link>
    </div>
  );
}
