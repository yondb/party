'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Users, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';
import { Card } from '@/components/ui/Card';
import { CATEGORY_LIST, type CategoryId } from '@/lib/categories';
import { cn } from '@/lib/utils';

type Step = 1 | 2;
type Gender = 'all' | 'female' | 'male';

type NewSlotWizardProps = {
  initialPlaceName?: string;
  placeId?: string;
};

export function NewSlotWizard({ initialPlaceName = '', placeId }: NewSlotWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [placeName, setPlaceName] = useState(initialPlaceName);
  const [startAt, setStartAt] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [gender, setGender] = useState<Gender>('all');
  const [description, setDescription] = useState('');

  return (
    <div className="mx-auto max-w-2xl px-4 lg:px-8 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={() => (step === 1 ? router.back() : setStep(1))}
          className="inline-flex items-center gap-1.5 text-body text-ash-700 hover:text-ash-900"
        >
          <ArrowLeft className="size-4" />
          Wróć
        </button>
        <span className="font-mono text-body-sm text-ash-500">Krok {step}/2</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-10">
        <div className="h-1 rounded-full bg-honey-500" />
        <div className={cn('h-1 rounded-full transition-all', step === 2 ? 'bg-honey-500' : 'bg-ash-200')} />
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-fade-up">
          <header>
            <h1 className="font-display text-display-xl text-ash-900">Co robisz?</h1>
            <p className="mt-2 text-body-lg text-ash-500">Wybierz aktywność.</p>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORY_LIST.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'aspect-square rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200',
                    'border-2',
                    active
                      ? 'border-honey-500 shadow-honey scale-[1.02]'
                      : 'border-transparent bg-surface shadow-sm hover:shadow-md hover:scale-[1.01]'
                  )}
                  style={active ? { backgroundColor: `${cat.color}14` } : undefined}
                >
                  <span className="text-4xl">{cat.emoji}</span>
                  <span className="font-display text-display-md text-ash-900">{cat.label}</span>
                  {active && <Check className="size-4 text-honey-700" />}
                </button>
              );
            })}
          </div>

          <Input
            label="Miejsce"
            placeholder="np. Park Łazienkowski"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
          />

          <Button fullWidth size="lg" disabled={!category || !placeName} onClick={() => setStep(2)}>
            Dalej
          </Button>
        </div>
      )}

      {step === 2 && category && (
        <div className="space-y-8 animate-fade-up">
          <header>
            <h1 className="font-display text-display-xl text-ash-900">Kiedy i z kim?</h1>
            <p className="mt-2 text-body-lg text-ash-500">Detale slota.</p>
          </header>

          <Card className="!bg-honey-50 !border-honey-200/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{CATEGORY_LIST.find((c) => c.id === category)?.emoji}</span>
              <div>
                <p className="font-display text-heading-md text-ash-900">
                  {CATEGORY_LIST.find((c) => c.id === category)?.label}
                </p>
                <p className="font-mono text-body-sm text-ash-600">{placeName}</p>
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-body-sm font-medium text-honey-700 hover:underline">
              Zmień
            </button>
          </Card>

          <Input label="Data i godzina" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />

          <Stepper label="Wielkość paczki (z hostem)" value={partySize} min={2} max={20} onChange={setPartySize} />

          <div className="space-y-1.5">
            <span className="block text-caption text-ash-500">Kto może dołączyć</span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'all' as const, label: 'Wszyscy', icon: Users },
                  { id: 'female' as const, label: 'Tylko kobiety', icon: UserIcon },
                  { id: 'male' as const, label: 'Tylko mężczyźni', icon: UserIcon },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const active = gender === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setGender(id)}
                    className={cn(
                      'h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border transition',
                      active
                        ? 'bg-graphite text-surface border-graphite'
                        : 'bg-surface text-ash-700 border-ash-200 hover:bg-ash-50'
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="text-caption text-center px-1">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Opis (opcjonalnie)"
            placeholder="Co dobrze byłoby wiedzieć?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button
            fullWidth
            size="lg"
            disabled={!startAt}
            onClick={() => {
              const qs = placeId ? `?place_id=${placeId}` : '';
              router.push(`/slots/new${qs}`);
            }}
          >
            Stwórz slot
          </Button>
        </div>
      )}
    </div>
  );
}
