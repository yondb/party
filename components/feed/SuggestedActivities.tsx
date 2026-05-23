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
      <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">{title}</h2>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FEATURED.map((key) => {
          const act = ACTIVITIES[key];
          const active = activeActivity === key;
          return (
            <Link
              key={key}
              href={buildFeedHref(key, validDate)}
              className={`chip shrink-0 ${active ? "chip-active" : ""}`}
              style={
                !active
                  ? { background: `color-mix(in srgb, ${act.color} 12%, white)` }
                  : undefined
              }
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
