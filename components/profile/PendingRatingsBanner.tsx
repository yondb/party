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
    <div
      className="floating-card mb-4 p-4"
      style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}
    >
      <p className="text-sm font-semibold text-[var(--accent-text)]">{t.title}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {items.length === 1
          ? t.oneSlot(first.title, first.pendingCount)
          : t.manySlots(items.length)}
      </p>
      <Link href={first.rateHref} className="btn-primary mt-3 inline-flex min-h-[44px] px-4 text-sm">
        {t.cta}
      </Link>
    </div>
  );
}
