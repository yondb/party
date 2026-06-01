'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Plus, Search } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';

type TopBarProps = {
  userName?: string;
  userLevel?: number;
  avatarUrl?: string | null;
  isGuest?: boolean;
  unreadCount?: number;
};

export function TopBar({ userName = 'BRE', userLevel = 1, avatarUrl, isGuest, unreadCount = 0 }: TopBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/map?q=${encodeURIComponent(q)}` : '/map');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ash-200/70 bg-surface/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl h-14 lg:h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="shrink-0 lg:hidden">
          <Logo size="sm" href="/map" />
        </div>
        <div className="hidden shrink-0 lg:block">
          <Logo size="md" href="/map" />
        </div>

        <form onSubmit={submitSearch} className="hidden lg:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ash-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj miejsca lub kategorii..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-ash-200/80 bg-surface-2 text-body-sm text-ash-900 placeholder:text-ash-400 focus:outline-none focus:border-ash-400 focus:ring-2 focus:ring-ash-200/80 transition"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 lg:gap-3">
          {!isGuest ? (
            <Link href="/slots/new" className="hidden lg:inline-flex">
              <span className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-graphite px-3.5 text-body-sm font-medium text-surface shadow-md transition hover:bg-graphite-soft">
                <Plus className="size-4" />
                Nowy slot
              </span>
            </Link>
          ) : null}
          {!isGuest ? (
            <Link
              href="/notifications"
              className="relative size-10 rounded-full hover:bg-ash-100 flex items-center justify-center transition"
              aria-label="Powiadomienia"
            >
              <Bell className="size-5 text-ash-700" />
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-honey-500 text-graphite text-[10px] font-bold leading-none ring-2 ring-surface flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Link href={isGuest ? '/auth' : '/profile'}>
            <Avatar src={avatarUrl} name={userName} size="md" level={isGuest ? undefined : userLevel} />
          </Link>
        </div>
      </div>
    </header>
  );
}
