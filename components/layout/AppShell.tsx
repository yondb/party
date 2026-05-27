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
};

export function AppShell({
  children,
  isGuest = false,
  userName,
  userLevel,
  avatarUrl,
}: AppShellProps) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const showFAB = pathname.startsWith('/map') && !isGuest;

  if (isPublic) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <TopBar userName={userName} userLevel={userLevel} avatarUrl={avatarUrl} isGuest={isGuest} />
      <div className="flex-1 flex">
        <Sidebar isGuest={isGuest} />
        <main className="flex-1 pb-20 lg:pb-0 lg:pl-20 min-w-0">{children}</main>
      </div>
      <BottomNav isGuest={isGuest} />
      {showFAB ? <FAB /> : null}
    </div>
  );
}
