"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSlotAction, type CreateSlotInput } from "@/app/actions/slots";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlacePicker } from "@/components/places/PlacePicker";
import {
  PLACE_CATEGORY_META,
  placeCategoryLabel,
  type PlaceCategory,
  type PlaceRow,
} from "@/lib/places";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { ICON_ANY, ICON_FEMALE, ICON_MALE, pageHeaderUi } from "@/lib/i18n-ui";

const COPY = {
  en: {
    header: "New slot",
    stepPlace: "Choose place",
    stepDetails: "Slot details",
    stepConfirm: "Confirm",
    next: "Continue",
    back: "Back",
    changePlace: "Change place",
    datetime: "Date and time",
    spots: "Party size (including host)",
    audience: "Who can join",
    audienceAny: "Everyone",
    audienceWomen: "Women only",
    audienceMen: "Men only",
    description: "Description (optional)",
    create: "Create slot",
    creating: "Creating…",
    errPlace: "Pick a place on the map or from the list.",
    errDate: "Pick a date and time.",
    summaryPlace: "Place",
    summaryWhen: "When",
    summarySpots: "Spots",
  },
  pl: {
    header: "Nowy slot",
    stepPlace: "Wybierz miejsce",
    stepDetails: "Szczegóły slotu",
    stepConfirm: "Potwierdzenie",
    next: "Dalej",
    back: "Wstecz",
    changePlace: "Zmień miejsce",
    datetime: "Data i godzina",
    spots: "Wielkość party (z hostem)",
    audience: "Kto może dołączyć",
    audienceAny: "Wszyscy",
    audienceWomen: "Tylko kobiety",
    audienceMen: "Tylko mężczyźni",
    description: "Opis (opcjonalnie)",
    create: "Stwórz slot",
    creating: "Tworzenie…",
    errPlace: "Wybierz miejsce z listy.",
    errDate: "Wybierz datę i godzinę.",
    summaryPlace: "Miejsce",
    summaryWhen: "Kiedy",
    summarySpots: "Miejsca",
  },
} as const;

type SlotCreateFormProps = {
  places: PlaceRow[];
  initialPlaceId?: string;
};

function resolvePlace(places: PlaceRow[], id?: string | null) {
  if (!id) return null;
  return places.find((p) => p.id === id) ?? null;
}

export function SlotCreateForm({ places, initialPlaceId }: SlotCreateFormProps) {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const router = useRouter();
  const searchParams = useSearchParams();
  const placeIdFromUrl = searchParams.get("place_id") ?? initialPlaceId ?? undefined;

  const preselectedPlace = useMemo(
    () => resolvePlace(places, placeIdFromUrl),
    [places, placeIdFromUrl],
  );
  const skipPlaceStep = Boolean(preselectedPlace);

  const [step, setStep] = useState(() => (skipPlaceStep ? 2 : 1));
  const [place, setPlace] = useState<PlaceRow | null>(() => preselectedPlace);
  const [dateTime, setDateTime] = useState("");
  const [maxSpots, setMaxSpots] = useState(4);
  const [genderScope, setGenderScope] = useState<"any" | "female" | "male">("any");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ place?: string; dateTime?: string }>({});

  useEffect(() => {
    const found = resolvePlace(places, placeIdFromUrl);
    if (!found) return;
    setPlace(found);
    setStep((s) => (s === 1 ? 2 : s));
  }, [places, placeIdFromUrl]);

  const locale = lang === "pl" ? "pl-PL" : "en-GB";
  const progressSteps = skipPlaceStep ? 2 : 3;
  const progressActive = skipPlaceStep ? step - 1 : step;

  const whenLabel = useMemo(() => {
    if (!dateTime) return "—";
    return new Date(dateTime).toLocaleString(locale, {
      weekday: "short",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [dateTime, locale]);

  function validateStep(current: number): boolean {
    const next: typeof fieldErrors = {};
    if (current === 1 && !place) next.place = t.errPlace;
    if (current === 2 && (!dateTime || Number.isNaN(Date.parse(dateTime)))) next.dateTime = t.errDate;
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(2) || !place) return;
    setLoading(true);
    setError(null);
    try {
      const payload: CreateSlotInput = {
        place_id: place.id,
        activity_type: place.category,
        title: place.name,
        description: description.trim() || undefined,
        date_time: new Date(dateTime).toISOString(),
        location_name: place.name,
        location_lat: place.lat,
        location_lng: place.lng,
        max_spots: maxSpots,
        min_reliability: 0,
        min_level: 0,
        gender_scope: genderScope,
      };
      const res = await createSlotAction(payload);
      if ("error" in res && res.error) setError(res.error);
      else if ("id" in res && res.id) router.push(`/slots/${res.id}`);
    } finally {
      setLoading(false);
    }
  }

  const placeMeta = place ? PLACE_CATEGORY_META[place.category as PlaceCategory] : null;

  function placeSummaryCard(compact?: boolean) {
    if (!place || !placeMeta) return null;
    return (
      <div
        className={`wow-card rounded-lg border border-[var(--gold-dim)] p-3 ${compact ? "" : "lg:p-4"}`}
      >
        <p className="font-display text-lg text-[var(--text-bright)] lg:text-xl">
          {placeMeta.icon} {place.name}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {placeCategoryLabel(lang, place.category as PlaceCategory)}
          {place.district ? ` · ${place.district}` : ""}
        </p>
        {skipPlaceStep ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--gold-mid)] hover:text-[var(--gold-bright)]"
          >
            {t.changePlace}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t.header} backHref="/map" backLabel={pageHeaderUi(lang).back} />

      <div className="mb-6 flex gap-2">
        {Array.from({ length: progressSteps }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full ${progressActive >= n ? "bg-[var(--gold-mid)]" : "bg-[var(--gold-dim)]/40"}`}
          />
        ))}
      </div>

      <form
        id="slot-create-form"
        onSubmit={onSubmit}
        className="space-y-6 pb-28 md:pb-6 lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:gap-10"
      >
        {step >= 2 && place ? (
          <aside className="hidden lg:block lg:sticky lg:top-24">{placeSummaryCard()}</aside>
        ) : null}

        <div className="min-w-0 space-y-6 lg:col-start-2 lg:row-start-1">
          {step === 1 ? (
            <section>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {t.stepPlace}
              </h2>
              <PlacePicker places={places} value={place} onChange={setPlace} />
              {fieldErrors.place ? (
                <p className="mt-2 text-sm text-[var(--status-full)]">{fieldErrors.place}</p>
              ) : null}
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {t.stepDetails}
              </h2>
              <div className="lg:hidden">{placeSummaryCard(true)}</div>
              <Input
                label={t.datetime}
                type="datetime-local"
                lang={lang === "pl" ? "pl" : "en-US"}
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                error={fieldErrors.dateTime}
                required
              />
              <div className="flex items-center justify-between rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] px-3 py-2">
                <span className="text-sm text-[var(--text-secondary)]">{t.spots}</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="!px-3 !py-1"
                    onClick={() => setMaxSpots((n) => Math.max(2, n - 1))}
                  >
                    −
                  </Button>
                  <span className="font-display w-8 text-center text-[var(--gold-bright)]">{maxSpots}</span>
                  <Button
                    type="button"
                    variant="secondary"
                    className="!px-3 !py-1"
                    onClick={() => setMaxSpots((n) => Math.min(10, n + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {t.audience}
                </p>
                <div className="flex gap-2 md:max-w-xl">
                  {(
                    [
                      { key: "any" as const, icon: ICON_ANY, label: t.audienceAny },
                      { key: "female" as const, icon: ICON_FEMALE, label: t.audienceWomen },
                      { key: "male" as const, icon: ICON_MALE, label: t.audienceMen },
                    ] as const
                  ).map(({ key, icon, label }) => {
                    const sel = genderScope === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setGenderScope(key)}
                        className={`flex min-h-[4rem] flex-1 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center text-[10px] font-semibold uppercase sm:text-xs ${
                          sel
                            ? "border-[var(--gold-bright)] bg-[linear-gradient(180deg,#e8c56a,#c9963a)] text-[var(--bg-void)]"
                            : "border-[var(--gold-dim)] text-[var(--text-muted)]"
                        }`}
                      >
                        <span className="font-mono text-2xl">{icon}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Textarea
                label={t.description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </section>
          ) : null}

          {step === 3 ? (
            <section className="wow-card space-y-3 rounded-lg p-4 md:max-w-xl">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {t.stepConfirm}
              </h2>
              <p>
                <span className="text-[var(--text-muted)]">{t.summaryPlace}: </span>
                <span className="text-[var(--text-bright)]">{place?.name}</span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">{t.summaryWhen}: </span>
                <span className="text-[var(--text-bright)]">{whenLabel}</span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">{t.summarySpots}: </span>
                <span className="text-[var(--text-bright)]">{maxSpots}</span>
              </p>
            </section>
          ) : null}

          {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}

          <div className="hidden gap-2 md:flex lg:max-w-xl">
            {step > (skipPlaceStep ? 2 : 1) ? (
              <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
                {t.back}
              </Button>
            ) : null}
            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => {
                  if (validateStep(step)) setStep((s) => s + 1);
                }}
              >
                {t.next}
              </Button>
            ) : (
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? t.creating : t.create}
              </Button>
            )}
          </div>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--gold-dim)] bg-[var(--bg-void)]/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          {step > (skipPlaceStep ? 2 : 1) ? (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              {t.back}
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={() => {
                if (validateStep(step)) setStep((s) => s + 1);
              }}
            >
              {t.next}
            </Button>
          ) : (
            <Button type="submit" form="slot-create-form" variant="primary" className="flex-1" disabled={loading}>
              {loading ? t.creating : t.create}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
