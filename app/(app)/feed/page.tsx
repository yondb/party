import Link from 'next/link';
import { Sun, ArrowRight, CalendarPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServerLang } from '@/lib/i18n-server';
import { feedUi } from '@/lib/i18n-ui';
import { toCategoryId } from '@/lib/categories';
import { SlotCard, type SlotData } from '@/components/slot/SlotCard';

export const dynamic = 'force-dynamic';

type SlotRow = {
  id: string;
  title: string;
  activity_type: string;
  date_time: string;
  location_name: string;
  max_spots: number;
  spots_taken: number;
  status: string;
  place_id: string | null;
  host_id: string;
};

type UserRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  reliability_score: number | null;
};

type PlaceRow = { id: string; name: string; category: string };

export default async function FeedPage() {
  const lang = await getServerLang();
  const ui = feedUi(lang);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();
  const { data: slotsData } = await supabase
    .from('slots')
    .select(
      'id, title, activity_type, date_time, location_name, max_spots, spots_taken, status, place_id, host_id',
    )
    .in('status', ['open', 'full'])
    .gte('date_time', nowIso)
    .order('date_time', { ascending: true })
    .limit(12);

  const slots = (slotsData ?? []) as SlotRow[];
  const slotIds = slots.map((s) => s.id);

  const { data: appsData } = slotIds.length
    ? await supabase
        .from('applications')
        .select('slot_id, applicant_id')
        .eq('status', 'accepted')
        .in('slot_id', slotIds)
    : { data: [] as { slot_id: string; applicant_id: string }[] };
  const apps = (appsData ?? []) as { slot_id: string; applicant_id: string }[];

  const userIds = Array.from(
    new Set([
      ...slots.map((s) => s.host_id),
      ...apps.map((a) => a.applicant_id),
      ...(user ? [user.id] : []),
    ]),
  );
  const { data: usersData } = userIds.length
    ? await supabase
        .from('users')
        .select('id, name, avatar_url, reliability_score')
        .in('id', userIds)
    : { data: [] as UserRow[] };
  const userMap = new Map<string, UserRow>((usersData ?? []).map((u) => [u.id, u as UserRow]));

  const placeIds = Array.from(
    new Set(slots.map((s) => s.place_id).filter((v): v is string => Boolean(v))),
  );
  const { data: placesData } = placeIds.length
    ? await supabase.from('places').select('id, name, category').in('id', placeIds)
    : { data: [] as PlaceRow[] };
  const placeMap = new Map<string, PlaceRow>((placesData ?? []).map((p) => [p.id, p as PlaceRow]));

  const participantsBySlot = new Map<string, Array<{ name: string; avatarUrl?: string | null }>>();
  for (const a of apps) {
    const u = userMap.get(a.applicant_id);
    const arr = participantsBySlot.get(a.slot_id) ?? [];
    arr.push({ name: u?.name ?? '?', avatarUrl: u?.avatar_url });
    participantsBySlot.set(a.slot_id, arr);
  }

  const cards: SlotData[] = slots.map((s) => {
    const host = userMap.get(s.host_id);
    const place = s.place_id ? placeMap.get(s.place_id) : null;
    return {
      id: s.id,
      category: toCategoryId(place?.category ?? s.activity_type),
      title: place?.name ?? s.title,
      startAt: s.date_time,
      placeName: place?.name ?? s.location_name,
      host: {
        name: host?.name ?? '?',
        avatarUrl: host?.avatar_url ?? null,
        reliability: Math.round((host?.reliability_score ?? 1) * 100),
      },
      participants: participantsBySlot.get(s.id) ?? [],
      capacity: s.max_spots,
    };
  });

  const userName =
    (user && userMap.get(user.id)?.name) ||
    (user?.user_metadata?.name as string | undefined) ||
    (lang === 'pl' ? 'Cześć' : 'Hi');

  const todayLabel = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8 lg:py-8">
      <div className="space-y-6">
        <section className="panel-ash flex items-start justify-between gap-4 p-5 lg:p-6">
          <div className="space-y-1.5">
            <p className="text-caption uppercase tracking-wider text-ash-500">{todayLabel}</p>
            <h1 className="font-display text-display-xl text-ash-900 lg:text-display-2xl">
              {lang === 'pl' ? 'Cześć' : 'Hi'}, <span className="honey-highlight">{userName}</span> 👋
            </h1>
            <p className="max-w-md text-body text-ash-600">
              {cards.length > 0
                ? lang === 'pl'
                  ? `W okolicy ${cards.length} aktywnych slotów — wybierz coś dla siebie.`
                  : `${cards.length} active slots nearby — pick something for you.`
                : lang === 'pl'
                  ? 'Brak aktywnych slotów. Może stwórz pierwszy?'
                  : 'No active slots yet. Maybe create the first one?'}
            </p>
          </div>
          <Sun
            className="hidden size-16 shrink-0 animate-float text-ash-300 lg:block"
            strokeWidth={1.25}
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-display-md text-ash-900">{ui.nearbySection}</h2>
            <Link
              href="/map"
              className="inline-flex items-center gap-1 text-body-sm font-medium text-ash-600 hover:text-ash-900"
            >
              {lang === 'pl' ? 'Mapa' : 'Map'} <ArrowRight className="size-4" />
            </Link>
          </div>

          {cards.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {cards.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          ) : (
            <div className="panel-ash flex flex-col items-center gap-4 p-10 text-center">
              <CalendarPlus className="size-10 text-ash-400" strokeWidth={1.5} />
              <p className="max-w-sm text-body text-ash-600">
                {lang === 'pl'
                  ? 'Nikt jeszcze nie zaplanował aktywności w pobliżu. Bądź pierwszy i zaproś ekipę.'
                  : 'Nobody has planned anything nearby yet. Be the first and gather a crew.'}
              </p>
              <Link
                href="/slots/new"
                className="inline-flex items-center gap-2 rounded-full bg-graphite px-5 py-2.5 text-body-sm font-medium text-surface transition hover:opacity-90"
              >
                <CalendarPlus className="size-4" />
                {lang === 'pl' ? 'Stwórz slot' : 'Create slot'}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
