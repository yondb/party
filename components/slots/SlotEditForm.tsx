"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSlotAction, type CreateSlotInput } from "@/app/actions/slots";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { ICON_ANY, ICON_FEMALE, ICON_MALE } from "@/lib/i18n-ui";
import { PLACE_CATEGORY_META, placeCategoryLabel, type PlaceCategory } from "@/lib/places";
import { toDateTimeLocalValue } from "@/lib/slot-edit-form";

export type SlotEditInitial = {
  slotId: string;
  title: string;
  description: string;
  date_time: string;
  max_spots: number;
  gender_scope: "any" | "female" | "male";
  activity_type: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  place?: { name: string; category: PlaceCategory } | null;
};

const COPY = {
  en: {
    header: "Edit slot",
    placeLocked: "Place (locked)",
    datetime: "Date and time",
    spots: "Party size (including host)",
    audience: "Who can join",
    audienceAny: "Everyone",
    audienceWomen: "Women only",
    audienceMen: "Men only",
    description: "Description (optional)",
    save: "Save changes",
    saving: "Saving…",
    backManage: "Back to manage",
    errDate: "Pick a date and time.",
  },
  pl: {
    header: "Edytuj slot",
    placeLocked: "Miejsce (zablokowane)",
    datetime: "Data i godzina",
    spots: "Wielkość party (z hostem)",
    audience: "Kto może dołączyć",
    audienceAny: "Wszyscy",
    audienceWomen: "Tylko kobiety",
    audienceMen: "Tylko mężczyźni",
    description: "Opis (opcjonalnie)",
    save: "Zapisz zmiany",
    saving: "Zapisywanie…",
    backManage: "Wróć do zarządzania",
    errDate: "Wybierz datę i godzinę.",
  },
} as const;

export function SlotEditForm({ initial }: { initial: SlotEditInitial }) {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const router = useRouter();
  const [dateTime, setDateTime] = useState(() => toDateTimeLocalValue(initial.date_time));
  const [maxSpots, setMaxSpots] = useState(initial.max_spots);
  const [genderScope, setGenderScope] = useState(initial.gender_scope);
  const [description, setDescription] = useState(initial.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | undefined>();

  const placeMeta = initial.place ? PLACE_CATEGORY_META[initial.place.category] : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!dateTime || Number.isNaN(Date.parse(dateTime))) {
      setDateError(t.errDate);
      return;
    }
    setDateError(undefined);
    setLoading(true);
    try {
      const payload: CreateSlotInput = {
        activity_type: initial.activity_type,
        title: initial.place?.name ?? initial.title,
        description: description.trim() || undefined,
        date_time: new Date(dateTime).toISOString(),
        location_name: initial.location_name,
        location_lat: initial.location_lat,
        location_lng: initial.location_lng,
        max_spots: maxSpots,
        min_reliability: 0,
        min_level: 0,
        gender_scope: genderScope,
      };
      const res = await updateSlotAction(initial.slotId, payload);
      if ("error" in res && res.error) setError(res.error);
      else router.push(`/slots/${initial.slotId}/manage`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t.header}
        backHref={`/slots/${initial.slotId}/manage`}
        backLabel={t.backManage}
      />
      <form onSubmit={onSubmit} className="space-y-5 pb-8">
        {initial.place && placeMeta ? (
          <section className="card rounded-lg border border-[var(--border-medium)] p-3">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">{t.placeLocked}</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {placeMeta.icon} {initial.place.name}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {placeCategoryLabel(lang, initial.place.category)}
            </p>
          </section>
        ) : null}

        <Input
          label={t.datetime}
          type="datetime-local"
          lang={lang === "pl" ? "pl" : "en-US"}
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          error={dateError}
          required
        />

        <div className="flex items-center justify-between rounded border border-[var(--border-medium)] bg-[var(--bg-input)] px-3 py-2">
          <span className="text-sm text-[var(--text-secondary)]">{t.spots}</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" className="!px-3 !py-1" onClick={() => setMaxSpots((n) => Math.max(2, n - 1))}>
              −
            </Button>
            <span className="font-display w-8 text-center text-[var(--accent)]">{maxSpots}</span>
            <Button type="button" variant="secondary" className="!px-3 !py-1" onClick={() => setMaxSpots((n) => Math.min(10, n + 1))}>
              +
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {t.audience}
          </p>
          <div className="flex gap-2">
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
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border-medium)] text-[var(--text-muted)]"
                  }`}
                >
                  <span className="font-mono text-2xl">{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Textarea label={t.description} value={description} onChange={(e) => setDescription(e.target.value)} />

        {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? t.saving : t.save}
        </Button>
      </form>
    </div>
  );
}
