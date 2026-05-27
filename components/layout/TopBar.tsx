'use client';
import Link from 'next/link';
import { Bell, Plus, Search } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

type TopBarProps = {
  userName?: string;
  userLevel?: number;
  avatarUrl?: string | null;
  isGuest?: boolean;
};

export function TopBar({ userName = 'BRE', userLevel = 1, avatarUrl, isGuest }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-ash-200/70 bg-surface/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl h-14 lg:h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        <Link href="/map" className="flex items-baseline gap-0 select-none">
          <span className="font-display text-xl lg:text-2xl font-extrabold text-graphite leading-none">lf</span>
          <span className="font-sans text-xl lg:text-2xl font-medium text-ash-500 leading-none">party</span>
        </Link>

        <div className="hidden lg:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ash-400" />
            <input
              placeholder="Szukaj miejsca lub kategorii..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-ash-200/80 bg-surface-2 text-body-sm text-ash-900 placeholder:text-ash-400 focus:outline-none focus:border-ash-400 focus:ring-2 focus:ring-ash-200/80 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {!isGuest ? (
            <Link href="/slots/new" className="hidden lg:inline-flex">
              <span className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-graphite px-3.5 text-body-sm font-medium text-surface shadow-md transition hover:bg-graphite-soft">
                <Plus className="size-4" />
                Nowy slot
              </span>
            </Link>
          ) : null}
          <Link
            href="/notifications"
            className="relative size-10 rounded-full hover:bg-ash-100 flex items-center justify-center transition"
            aria-label="Powiadomienia"
          >
            <Bell className="size-5 text-ash-700" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-graphite ring-2 ring-surface" />
          </Link>
          <Link href={isGuest ? '/auth' : '/profile'}>
            <Avatar src={avatarUrl} name={userName} size="md" level={isGuest ? undefined : userLevel} />
          </Link>
        </div>
      </div>
    </header>
  );
}
