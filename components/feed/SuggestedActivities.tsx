"use client";

import Link from "next/link";
import { ACTIVITIES, type ActivityKey } from "@/lib/activities";
import { activityLabel } from "@/lib/i18n-ui";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const FEATURED: ActivityKey[] = [
  "running",
  "coffee",
  "volleyball",
  "cycling",
  "gym",
  "hiking",
  "padel",
  "tennis",
];

type Props = {
  activeActivity?: string;
  validDate?: string;
};

function buildFeedHref(activity: ActivityKey, date?: string) {
  const params = new URLSearchParams();
  params.set("activity", activity);
  if (date) params.set("date", date);
  return `/feed?${params.toString()}`;
}

export function SuggestedActivities({ activeActivity, validDate }: Props) {
  const { lang } = useLanguage();
  const title = lang === "pl" ? "Popularne aktywności" : "Popular activities";

  return (
    <section className="mb-6">
      <h2 className="mb-4 text-base font-bold text-slate-800">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FEATURED.map((key) => {
          const act = ACTIVITIES[key];
          const active = activeActivity === key;
          return (
            <Link
              key={key}
              href={buildFeedHref(key, validDate)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                active
                  ? "bg-ash-900 text-surface shadow-sm"
                  : "bg-surface text-ash-800 shadow-sm hover:bg-ash-100 hover:shadow-[0_0_0_1px_rgba(245,184,0,0.35)]"
              }`}
            >
              <span>{act.icon}</span>
              {activityLabel(lang, key)}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
