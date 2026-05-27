import Link from 'next/link';
import { Sun, ArrowRight } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LIST } from '@/lib/categories';

type FeedHeroProps = {
  userName: string;
  activeCount: number;
};

export function FeedHero({ userName, activeCount }: FeedHeroProps) {
  const today = new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <>
      <section className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="text-caption uppercase tracking-wider text-ash-500">{today}</p>
          <h1 className="font-display text-display-xl lg:text-display-2xl text-ash-900">
            Cześć, <span className="honey-highlight">{userName}</span> 👋
          </h1>
          <p className="text-body-lg text-ash-500 max-w-md">
            W okolicy {activeCount} aktywnych slotów czeka na Ciebie.
          </p>
        </div>
        <Sun className="hidden lg:block size-20 text-honey-400 animate-float shrink-0" strokeWidth={1.5} />
      </section>

      <section>
        <h2 className="font-display text-display-md text-ash-900 mb-4">Popularne</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORY_LIST.map((cat) => (
            <Chip key={cat.id} emoji={cat.emoji}>
              {cat.label}
            </Chip>
          ))}
        </div>
      </section>

      <Card className="!bg-honey-50 !border-honey-200/50">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-honey-500 flex items-center justify-center text-2xl shrink-0">✨</div>
          <div className="flex-1">
            <p className="font-display text-heading-md text-ash-900">Nic dla Ciebie?</p>
            <p className="text-body-sm text-ash-600">Stwórz własny slot — ktoś dołączy w 20 min.</p>
          </div>
          <Link href="/slots/new">
            <Button size="sm" variant="dark" icon={<ArrowRight className="size-4" />}>
              Stwórz
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
