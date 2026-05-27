'use client';

import Link from 'next/link';
import { Sun, ArrowRight } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { SlotCard, slotDataFromLegacy } from '@/components/slot/SlotCard';
import { CATEGORY_LIST } from '@/lib/categories';
import type { SlotCardData } from '@/components/slots/SlotCard';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { activityLabel, feedUi } from '@/lib/i18n-ui';
import { formatFilterDate } from '@/lib/geo';
import { cn } from '@/lib/utils';
import type { ActivityKey } from '@/lib/activities';

type FeedExperienceProps = {
  userName: string;
  cards: SlotCardData[];
  allCards: SlotCardData[];
  activityOptions: ActivityKey[];
  dateOptions: string[];
  validActivity?: ActivityKey;
  validDate?: string;
  buildHref: (next: { activity?: string; date?: string }) => string;
};

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-body-sm font-medium transition-all duration-150',
        active
          ? 'bg-graphite text-surface shadow-sm'
          : 'border border-ash-200/60 bg-surface text-ash-700 hover:border-ash-300 hover:bg-ash-50',
      )}
    >
      {children}
    </Link>
  );
}

export function FeedExperience({
  userName,
  cards,
  allCards,
  activityOptions,
  dateOptions,
  validActivity,
  validDate,
  buildHref,
}: FeedExperienceProps) {
  const { lang } = useLanguage();
  const ui = feedUi(lang);

  const today = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const nearby = cards.slice(0, 4);
  const recommended = cards.length > 2 ? cards.slice(2, 6) : cards.slice(0, 2);

  const toSlotData = (slot: SlotCardData) =>
    slotDataFromLegacy({
      ...slot,
      host: slot.host
        ? {
            name: slot.host.name,
            avatar_url: slot.host.avatar_url,
            reliability_score: slot.host.reliability_score,
          }
        : null,
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <div className="space-y-6">
        {/* HERO */}
        <section className="panel-ash flex items-start justify-between gap-4 p-5 lg:p-6">
          <div className="space-y-1.5">
            <p className="text-caption uppercase tracking-wider text-ash-500">{today}</p>
            <h1 className="font-display text-display-xl text-ash-900 lg:text-display-2xl">
              Cześć, <span className="honey-highlight">{userName}</span> 👋
            </h1>
            <p className="max-w-md text-body text-ash-600">
              {lang === 'pl'
                ? `W okolicy ${allCards.length} aktywnych slotów — wybierz coś dla siebie.`
                : `${allCards.length} active slots nearby — pick something for you.`}
            </p>
          </div>
          <Sun
            className="hidden size-16 shrink-0 animate-float text-ash-300 lg:block"
            strokeWidth={1.25}
          />
        </section>

        {/* FILTRY */}
        <section className="panel-ash sticky top-[3.5rem] z-20 space-y-2.5 p-3 backdrop-blur-md lg:top-16">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <FilterLink href={buildHref({ date: validDate })} active={!validActivity}>
              {ui.allActivities}
            </FilterLink>
            {activityOptions.map((k) => (
              <FilterLink
                key={k}
                href={buildHref({ activity: k, date: validDate })}
                active={validActivity === k}
              >
                {activityLabel(lang, k)}
              </FilterLink>
            ))}
          </div>
          {dateOptions.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <FilterLink href={buildHref({ activity: validActivity })} active={!validDate}>
                {ui.allDates}
              </FilterLink>
              {dateOptions.map((d) => (
                <FilterLink
                  key={d}
                  href={buildHref({ activity: validActivity, date: d })}
                  active={validDate === d}
                >
                  {formatFilterDate(d, lang)}
                </FilterLink>
              ))}
            </div>
          ) : null}
        </section>

        {/* POPULARNE KATEGORIE */}
        <section>
          <h2 className="mb-3 font-display text-display-md text-ash-900">Popularne</h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORY_LIST.map((cat) => (
              <Chip key={cat.id} emoji={cat.emoji}>
                {cat.label}
              </Chip>
            ))}
          </div>
        </section>

        {/* W OKOLICY */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-display-md text-ash-900">{ui.nearbySection}</h2>
            <Link
              href="/map"
              className="inline-flex items-center gap-1 text-body-sm font-medium text-ash-600 hover:text-ash-900"
            >
              Mapa <ArrowRight className="size-4" />
            </Link>
          </div>

          {nearby.length === 0 ? (
            <Card className="!p-8 text-center">
              <p className="font-display text-heading-md text-ash-900">{ui.emptyTitle}</p>
              <p className="mt-2 text-body-sm text-ash-500">{ui.emptySubtitle}</p>
              <Link
                href="/map"
                className="mt-5 inline-flex h-9 items-center justify-center rounded-2xl bg-graphite px-3.5 text-body-sm font-medium text-surface shadow-md transition hover:bg-graphite-soft"
              >
                {ui.goToMap}
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {nearby.map((slot) => (
                <SlotCard key={slot.id} slot={toSlotData(slot)} />
              ))}
            </div>
          )}
        </section>

        {/* CTA — miodowy akcent, nie żółte tło */}
        <Card className="!border-l-4 !border-l-honey-500 !bg-surface !p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-ash-200/60 bg-ash-100 text-xl">
              ✨
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-heading-md text-ash-900">
                {lang === 'pl' ? 'Nic dla Ciebie?' : 'Nothing for you?'}
              </p>
              <p className="text-body-sm text-ash-600">
                {lang === 'pl'
                  ? 'Stwórz własny slot — ktoś dołączy w 20 min.'
                  : 'Create a slot — someone may join in 20 min.'}
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-2xl bg-graphite px-3.5 text-body-sm font-medium text-surface shadow-md transition hover:bg-graphite-soft"
            >
              {lang === 'pl' ? 'Na mapę' : 'Map'}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Card>

        {/* POLECANE */}
        {recommended.length > 0 ? (
          <section>
            <h2 className="mb-3 font-display text-display-md text-ash-900">
              {lang === 'pl' ? 'Polecane dla Ciebie' : 'Recommended for you'}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {recommended.map((slot) => (
                <SlotCard key={`rec-${slot.id}`} slot={toSlotData(slot)} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
