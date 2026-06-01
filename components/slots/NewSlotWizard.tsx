'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Users, User as UserIcon, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';
import { Card } from '@/components/ui/Card';
import { CATEGORY_LIST, type CategoryId, toCategoryId, categoryLabel } from '@/lib/categories';
import type { PlaceCategory } from '@/lib/places';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { createSlotAction } from '@/app/actions/slots';
import type { PlacePick } from '@/components/slots/PlacePickerModal';

const PlacePickerModal = dynamic(
  () => import('@/components/slots/PlacePickerModal').then((m) => m.PlacePickerModal),
  { ssr: false },
);

type Step = 1 | 2;
type Gender = 'all' | 'female' | 'male';

export type PlaceOption = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string | null;
  district: string | null;
  category: PlaceCategory;
};

type SelectedPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
};

type NewSlotWizardProps = {
  places: PlaceOption[];
  initialPlaceId?: string;
};

export function NewSlotWizard({ places, initialPlaceId }: NewSlotWizardProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const initialPlace = initialPlaceId
    ? places.find((p) => p.id === initialPlaceId)
    : undefined;

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<CategoryId | null>(
    initialPlace ? toCategoryId(initialPlace.category) : null,
  );

  const [placeQuery, setPlaceQuery] = useState(initialPlace?.name ?? '');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    initialPlace
      ? {
          id: initialPlace.id,
          name: initialPlace.name,
          lat: initialPlace.lat,
          lng: initialPlace.lng,
          category: initialPlace.category,
        }
      : null,
  );
  const [customPoint, setCustomPoint] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const [startAt, setStartAt] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [gender, setGender] = useState<Gender>('all');
  const [minLevel, setMinLevel] = useState(0);
  const [minReliability, setMinReliability] = useState(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosenName = selectedPlace?.name ?? customPoint?.name ?? '';
  const hasPlace = Boolean(selectedPlace || customPoint);
  const categoryLocked = selectedPlace !== null;
  const lockedCategory = categoryLocked && category ? CATEGORY_LIST.find((c) => c.id === category) : null;

  const suggestions = useMemo(() => {
    const q = placeQuery.trim().toLowerCase();
    let pool = places;
    if (category && !categoryLocked) {
      pool = pool.filter((p) => toCategoryId(p.category) === category);
    }
    if (!q) return pool.slice(0, 8);
    return pool
      .filter((p) =>
        `${p.name} ${p.city ?? ''} ${p.district ?? ''}`.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [places, placeQuery, category, categoryLocked]);

  function selectExisting(p: PlaceOption) {
    setSelectedPlace({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      category: p.category,
    });
    setCategory(toCategoryId(p.category));
    setCustomPoint(null);
    setPlaceQuery(p.name);
    setShowSuggestions(false);
  }

  function handlePlaceQueryChange(value: string) {
    setPlaceQuery(value);
    setSelectedPlace(null);
    setCustomPoint(null);
    setCategory(null);
    setShowSuggestions(true);
  }

  function applyCustomPoint(point: { lat: number; lng: number; name: string }) {
    setCustomPoint(point);
    setSelectedPlace(null);
    setCategory(null);
    setPlaceQuery(point.name);
    setMapOpen(false);
    setShowSuggestions(false);
  }

  function handlePlacePick(pick: PlacePick) {
    if (pick.kind === 'existing') {
      const place = places.find((p) => p.id === pick.id);
      if (place) {
        selectExisting(place);
      } else {
        selectExisting({
          id: pick.id,
          name: pick.name,
          lat: pick.lat,
          lng: pick.lng,
          city: null,
          district: null,
          category: 'running',
        });
      }
      setMapOpen(false);
      return;
    }
    applyCustomPoint(pick);
  }

  async function submit() {
    if (!category || !hasPlace || !startAt) return;
    const lat = selectedPlace?.lat ?? customPoint?.lat;
    const lng = selectedPlace?.lng ?? customPoint?.lng;
    if (lat == null || lng == null) return;

    setSubmitting(true);
    setError(null);
    const res = await createSlotAction({
      place_id: selectedPlace?.id,
      activity_type: category,
      title: chosenName || category,
      description: description.trim() || undefined,
      date_time: new Date(startAt).toISOString(),
      location_name: chosenName,
      location_lat: lat,
      location_lng: lng,
      max_spots: partySize,
      min_reliability: minReliability,
      min_level: minLevel,
      gender_scope: gender === 'all' ? 'any' : gender,
    });
    if ('error' in res) {
      setError(res.error ?? 'Nie udało się utworzyć slota.');
      setSubmitting(false);
      return;
    }
    router.push(`/slots/${res.id}`);
  }

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
            <p className="mt-2 text-body-lg text-ash-500">
              {categoryLocked
                ? 'Miejsce ma przypisaną aktywność — wybierz termin w następnym kroku.'
                : 'Wybierz aktywność i miejsce.'}
            </p>
          </header>

          {categoryLocked && hasPlace ? (
            <div className="space-y-2">
              <span className="block text-caption text-ash-500">Miejsce</span>
              <div className="flex items-center gap-3 rounded-3xl border border-ash-200 bg-surface p-4 shadow-sm">
                <MapPin className="size-5 shrink-0 text-honey-600" />
                <div className="min-w-0">
                  <p className="truncate font-display text-heading-md text-ash-900">{chosenName}</p>
                  {lockedCategory ? (
                    <p className="text-body-sm text-ash-500">
                      {lockedCategory.emoji} {categoryLabel(lang, lockedCategory.id)}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handlePlaceQueryChange('')}
                  className="ml-auto shrink-0 text-body-sm font-medium text-ash-600 hover:text-ash-900 hover:underline"
                >
                  Zmień
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="block text-caption text-ash-500">Miejsce</span>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-ash-400" />
                <input
                  value={placeQuery}
                  onChange={(e) => handlePlaceQueryChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Szukaj miejsca…"
                  className="h-12 w-full rounded-2xl border border-ash-200 bg-surface pl-10 pr-4 text-body text-ash-900 placeholder:text-ash-400 focus:border-honey-500 focus:outline-none focus:ring-2 focus:ring-honey-200"
                />
                {showSuggestions && suggestions.length > 0 ? (
                  <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-ash-200/70 bg-surface p-1 shadow-lg">
                    {suggestions.map((p) => {
                      const cat = CATEGORY_LIST.find((c) => c.id === toCategoryId(p.category));
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectExisting(p)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-ash-50"
                          >
                            <span className="text-lg" aria-hidden>{cat?.emoji}</span>
                            <span className="min-w-0">
                              <span className="block truncate text-body-sm font-medium text-ash-900">
                                {p.name}
                              </span>
                              <span className="block truncate text-caption text-ash-500">
                                {[categoryLabel(lang, toCategoryId(p.category)), p.district, p.city].filter(Boolean).join(' · ')}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="inline-flex items-center gap-1.5 text-body-sm font-medium text-ash-600 hover:text-ash-900"
              >
                <MapPin className="size-4" />
                lub wybierz na mapie →
              </button>

              {hasPlace ? (
                <p className="flex items-center gap-1.5 text-body-sm text-success">
                  <Check className="size-4" />
                  {customPoint ? 'Punkt na mapie: ' : 'Wybrano: '}
                  <span className="font-medium text-ash-900">{chosenName}</span>
                </p>
              ) : null}
            </div>
          )}

          {categoryLocked && lockedCategory ? (
            <div
              className="flex max-w-xs flex-col items-center justify-center gap-2 rounded-2xl border-2 border-honey-500 p-4 shadow-honey"
              style={{ backgroundColor: `${lockedCategory.color}14` }}
            >
              <span className="text-4xl" aria-hidden>{lockedCategory.emoji}</span>
              <span className="font-display text-heading-md text-ash-900">{categoryLabel(lang, lockedCategory.id)}</span>
              <p className="text-center text-caption text-ash-500">
                Aktywność przypisana do wybranego miejsca
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="block text-caption text-ash-500">Aktywność</span>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_LIST.map((cat) => {
                  const active = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        'rounded-2xl py-2.5 px-1 flex flex-col items-center justify-center gap-1 transition-all duration-200',
                        'border-2 min-h-[72px]',
                        active
                          ? 'border-honey-500 shadow-honey'
                          : 'border-transparent bg-surface shadow-sm hover:shadow-md',
                      )}
                      style={active ? { backgroundColor: `${cat.color}14` } : undefined}
                    >
                      <span className="text-2xl leading-none">{cat.emoji}</span>
                      <span className="text-[11px] font-medium text-ash-900 text-center leading-tight px-0.5">
                        {categoryLabel(lang, cat.id)}
                      </span>
                      {active && <Check className="size-3.5 text-honey-700" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            disabled={!category || !hasPlace}
            onClick={() => setStep(2)}
          >
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

          <Card className="panel-ash !shadow-none flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{CATEGORY_LIST.find((c) => c.id === category)?.emoji}</span>
              <div>
                <p className="font-display text-heading-md text-ash-900">
                  {category ? categoryLabel(lang, category) : ''}
                </p>
                <p className="font-mono text-body-sm text-ash-600">{chosenName}</p>
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-body-sm font-medium text-ash-600 hover:text-ash-900 hover:underline">
              Zmień
            </button>
          </Card>

          <Input label="Data i godzina" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />

          <Stepper label="Wielkość paczki (z hostem)" value={partySize} min={2} max={10} onChange={setPartySize} />

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
                        : 'bg-surface text-ash-700 border-ash-200 hover:bg-ash-50',
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="text-caption text-center px-1">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-ash-200 bg-surface p-4">
            <span className="block text-caption text-ash-500">Wymagania (opcjonalnie)</span>
            <Stepper label="Minimalny poziom" value={minLevel} min={0} max={20} onChange={setMinLevel} />
            <div className="space-y-1.5">
              <span className="block text-caption text-ash-500">Minimalna rzetelność</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Brak', value: 0 },
                  { label: '70%', value: 0.7 },
                  { label: '80%', value: 0.8 },
                  { label: '90%', value: 0.9 },
                ].map((opt) => {
                  const active = minReliability === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setMinReliability(opt.value)}
                      className={cn(
                        'h-10 rounded-xl border text-body-sm font-medium transition',
                        active
                          ? 'bg-graphite text-surface border-graphite'
                          : 'bg-surface text-ash-700 border-ash-200 hover:bg-ash-50',
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Textarea
            label="Opis (opcjonalnie)"
            placeholder="Co dobrze byłoby wiedzieć?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error ? <p className="text-body-sm text-danger">{error}</p> : null}

          <Button fullWidth size="lg" disabled={!startAt || submitting} loading={submitting} onClick={submit}>
            Stwórz slot
          </Button>
        </div>
      )}

      {mapOpen ? (
        <PlacePickerModal
          places={places}
          initialName={customPoint?.name ?? placeQuery}
          onPick={handlePlacePick}
          onClose={() => setMapOpen(false)}
        />
      ) : null}
    </div>
  );
}
