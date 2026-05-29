'use client';

import { usePathname } from 'next/navigation';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { FAB } from './FAB';

const PUBLIC_PREFIXES = ['/', '/auth', '/landing', '/legal', '/setup', '/onboarding', '/banned'];

type AppShellProps = {
  children: React.ReactNode;
  isGuest?: boolean;
  userName?: string;
  userLevel?: number;
  avatarUrl?: string | null;
  unreadCount?: number;
};

export function AppShell({
  children,
  isGuest = false,
  userName,
  userLevel,
  avatarUrl,
  unreadCount = 0,
}: AppShellProps) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const showFAB = pathname.startsWith('/map') && !isGuest;

  if (isPublic) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(253,230,138,0.12),transparent)]">
      <TopBar userName={userName} userLevel={userLevel} avatarUrl={avatarUrl} isGuest={isGuest} unreadCount={unreadCount} />
      <div className="flex-1 flex">
        <Sidebar isGuest={isGuest} />
        <main className="flex-1 pb-20 lg:pb-0 lg:pl-20 min-w-0">{children}</main>
      </div>
      <BottomNav isGuest={isGuest} />
      {showFAB ? <FAB /> : null}
    </div>
  );
}
