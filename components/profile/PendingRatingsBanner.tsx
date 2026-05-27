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
    <div className="mb-4 rounded-3xl border border-honey-200/50 bg-honey-50 p-4 shadow-sm">
      <p className="text-sm font-semibold text-honey-700">{t.title}</p>
      <p className="mt-1 text-sm text-ash-600">
        {items.length === 1
          ? t.oneSlot(first.title, first.pendingCount)
          : t.manySlots(items.length)}
      </p>
      <Link
        href={first.rateHref}
        className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-honey-500 px-4 text-sm font-semibold text-graphite shadow-honey"
      >
        {t.cta}
      </Link>
    </div>
  );
}
