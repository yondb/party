import { Settings, Pencil, Award, Trophy, Shield, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

type ProfileFixItProps = {
  name: string;
  gender: 'M' | 'F';
  level: number;
  levelName: string;
  xp: number;
  xpToNext: number;
  reliability: number;
  stats: { events: number; hosted: number; rating: string | null };
  city: string;
  badges: Array<{ id: string; name: string; earned: boolean; icon: 'trophy' | 'shield' | 'zap' | 'award' }>;
};

const ICONS = { trophy: Trophy, shield: Shield, zap: Zap, award: Award };

export function ProfileFixIt({
  name,
  gender,
  level,
  levelName,
  xp,
  xpToNext,
  reliability,
  stats,
  city,
  badges,
}: ProfileFixItProps) {
  const xpPct = xpToNext > 0 ? Math.round((xp / xpToNext) * 100) : 0;

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-ash-100 via-bg to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-honey-50/25 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-3xl space-y-5 px-4 py-5 lg:px-8 lg:py-8">
        <div className="flex justify-end gap-2">
          <Link href="/settings">
            <Button size="sm" variant="ghost" icon={<Settings className="size-4" />}>
              Ustawienia
            </Button>
          </Link>
          <Link href="/profile/edit">
            <Button size="sm" variant="primary" icon={<Pencil className="size-4" />}>
              Edytuj
            </Button>
          </Link>
        </div>

        <Card hero className="!bg-surface text-center">
          <div className="flex flex-col items-center">
            <Avatar name={name} size="2xl" level={level} ringColor="#F5B800" />
            <h1 className="mt-6 font-display text-display-xl text-ash-900 inline-flex items-center gap-2">
              {name}
              <span className="text-ash-400 text-display-lg">{gender === 'M' ? '♂' : '♀'}</span>
            </h1>
            <p className="mt-1 text-caption uppercase tracking-wider text-ash-500">
              {levelName} · {city}
            </p>

            <div className="mt-8 w-full max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-body-sm text-ash-700">
                  <span className="font-bold text-ash-900">{xp}</span>
                  <span className="text-ash-400"> / {xpToNext} XP</span>
                </span>
                <span className="font-mono text-body-sm font-bold text-honey-700">{xpPct}%</span>
              </div>
              <div className="relative h-3 rounded-full bg-ash-200 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-honey-400 via-honey-500 to-honey-600 rounded-full transition-all duration-1000 ease-out-soft"
                  style={{ width: `${xpPct}%` }}
                />
                {[25, 50, 75].map((t) => (
                  <span
                    key={t}
                    className="absolute top-1/2 -translate-y-1/2 size-1 rounded-full bg-bg/70"
                    style={{ left: `${t}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-caption text-ash-400">
                Następny: <span className="text-ash-700 font-semibold">Explorer</span> za {Math.max(0, xpToNext - xp)} XP
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <div
                className="relative size-24 rounded-full grid place-items-center"
                style={{
                  background: `conic-gradient(#16A34A ${reliability * 3.6}deg, #E4E4E7 0)`,
                }}
              >
                <div className="size-[88px] rounded-full bg-surface grid place-items-center">
                  <span className="font-display text-display-lg text-success">{reliability}%</span>
                </div>
              </div>
              <p className="mt-3 text-caption uppercase tracking-wider text-ash-500">Reliability</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <Card className="!p-5 text-center">
            <p className="font-display text-display-xl text-ash-900">{stats.events}</p>
            <p className="text-caption uppercase tracking-wider text-ash-500 mt-1">Wydarzeń</p>
          </Card>
          <Card className="!p-5 text-center">
            <p className="font-display text-display-xl text-honey-700">{stats.hosted}</p>
            <p className="text-caption uppercase tracking-wider text-ash-500 mt-1">Host</p>
          </Card>
          <Card className="!p-5 text-center">
            <p className="font-display text-display-md text-ash-400">{stats.rating ?? 'Brak ocen'}</p>
            <p className="text-caption uppercase tracking-wider text-ash-500 mt-1">Ocena</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-heading-md text-ash-900">Odznaki</h2>
            <span className="font-mono text-body-sm text-ash-500">
              <span className="text-ash-900 font-bold">{badges.filter((b) => b.earned).length}</span> / {badges.length}
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {badges.map((b) => {
              const Icon = ICONS[b.icon];
              return (
                <div key={b.id} className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={`size-16 rounded-2xl grid place-items-center transition ${
                      b.earned ? 'bg-honey-50 text-honey-700' : 'bg-ash-100 text-ash-300'
                    }`}
                  >
                    <Icon className="size-7" strokeWidth={2} />
                  </div>
                  <span className={`text-body-sm font-medium ${b.earned ? 'text-ash-900' : 'text-ash-400'}`}>
                    {b.name}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
