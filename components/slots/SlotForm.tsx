"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITIES, type ActivityKey } from "@/lib/activities";
import { createSlotAction, updateSlotAction, type CreateSlotInput } from "@/app/actions/slots";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ActivityIcon } from "./ActivityIcon";
import { PageHeader } from "@/components/layout/PageHeader";
import { LocationPickerMap } from "@/components/map/LocationPickerMap";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { activityLabel, ICON_ANY, ICON_FEMALE, ICON_MALE, pageHeaderUi } from "@/lib/i18n-ui";

const DEFAULT_POINT = { lat: 52.2297, lng: 21.0122 };
const COPY = {
  en: {
    header: "New quest",
    activityType: "Activity type",
    title: "Quest title",
    datetime: "Date and time",
    locationName: "Location name",
    locationPlaceholder: "e.g. City Park",
    pickOnMap: "Pick location on map",
    pinRequired: "Choose a point on map before publishing.",
    spots: "Party size (including host)",
    description: "Description (optional)",
    minReliability: "Minimum reliability",
    minLevel: "Minimum level",
    recurring: "Recurring quest",
    recurringPattern: "Pattern",
    recurringPlaceholder: "e.g. every Saturday",
    publish: "Publish quest",
    publishing: "Publishing...",
    preview: "Card preview",
    previewTitle: "Quest title",
    previewLocation: "Location",
    clickMapHint: "Click map to place a pin.",
    otherLabel: "Other activity",
    otherPlaceholder: "What are you looking for a team for?",
    top10Hint: "Pick a category, then an activity type.",
    groupMovement: "Movement",
    groupSocial: "Social",
    groupCustom: "Custom",
    audience: "Who can join",
    audienceAnyTitle: "Open to everyone",
    audienceWomenTitle: "Women only",
    audienceMenTitle: "Men only",
    headerEdit: "Edit quest",
    saveQuest: "Save changes",
    savingQuest: "Saving…",
    backManage: "Back to manage",
  },
  pl: {
    header: "Nowy quest",
    activityType: "Typ aktywności",
    title: "Tytuł questa",
    datetime: "Data i godzina",
    locationName: "Nazwa lokalizacji",
    locationPlaceholder: "np. Park miejski",
    pickOnMap: "Wybierz lokalizację na mapie",
    pinRequired: "Wskaż pinezkę na mapie przed publikacją.",
    spots: "Wielkość party (z hostem)",
    description: "Opis (opcjonalnie)",
    minReliability: "Minimalny reliability",
    minLevel: "Minimalny poziom",
    recurring: "Powtarzalny quest",
    recurringPattern: "Wzorzec",
    recurringPlaceholder: "np. co sobotę",
    publish: "Ogłoś quest",
    publishing: "Wysyłanie...",
    preview: "Podgląd karty",
    previewTitle: "Tytuł questa",
    previewLocation: "Lokalizacja",
    clickMapHint: "Kliknij mapę, aby ustawić pinezkę.",
    otherLabel: "Inna aktywność",
    otherPlaceholder: "Na co szukasz drużyny?",
    top10Hint: "Wybierz kategorię, potem typ aktywności.",
    groupMovement: "Ruch",
    groupSocial: "Społeczne",
    groupCustom: "Własna aktywność",
    audience: "Kto może dołączyć",
    audienceAnyTitle: "Wszyscy",
    audienceWomenTitle: "Tylko kobiety",
    audienceMenTitle: "Tylko mężczyźni",
    headerEdit: "Edytuj quest",
    saveQuest: "Zapisz zmiany",
    savingQuest: "Zapisywanie…",
    backManage: "Wróć do zarządzania",
  },
} as const;

const ACTIVITY_GROUPS: { titleKey: "groupMovement" | "groupSocial" | "groupCustom"; keys: ActivityKey[] }[] = [
  {
    titleKey: "groupMovement",
    keys: ["running", "cycling", "hiking", "walking", "volleyball", "gym", "yoga"],
  },
  {
    titleKey: "groupSocial",
    keys: ["coffee", "boardgames", "movies", "food", "study"],
  },
  { titleKey: "groupCustom", keys: ["other"] },
];

export type SlotFormEdit = {
  slotId: string;
  activity_type: ActivityKey;
  title: string;
  description: string;
  otherActivity: string;
  dateTimeLocal: string;
  location_name: string;
  lat: number;
  lng: number;
  max_spots: number;
  minRelPercent: number;
  min_level: number;
  recurring: boolean;
  recurring_pattern: string | null;
  gender_scope: "any" | "female" | "male";
};

type SlotFormProps = {
  edit?: SlotFormEdit;
};

export function SlotForm({ edit }: SlotFormProps) {
  const isEdit = Boolean(edit);
  const { lang } = useLanguage();
  const t = COPY[lang];
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityKey>(() => edit?.activity_type ?? "running");
  const [title, setTitle] = useState(() => edit?.title ?? "");
  const [description, setDescription] = useState(() => edit?.description ?? "");
  const [otherActivity, setOtherActivity] = useState(() => edit?.otherActivity ?? "");
  const [dateTime, setDateTime] = useState(() => edit?.dateTimeLocal ?? "");
  const [locationName, setLocationName] = useState(() => edit?.location_name ?? "");
  const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number } | null>(() =>
    edit ? { lat: edit.lat, lng: edit.lng } : DEFAULT_POINT,
  );
  const [maxSpots, setMaxSpots] = useState(() => edit?.max_spots ?? 4);
  const [minRel, setMinRel] = useState(() => edit?.minRelPercent ?? 0);
  const [minLevel, setMinLevel] = useState(() => edit?.min_level ?? 0);
  const [recurring, setRecurring] = useState(() => edit?.recurring ?? false);
  const [pattern, setPattern] = useState(() => edit?.recurring_pattern ?? "");
  const [genderScope, setGenderScope] = useState<"any" | "female" | "male">(
    () => edit?.gender_scope ?? "any",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pickedPoint) {
      setError(t.pinRequired);
      return;
    }
    setLoading(true);
    try {
      const iso = new Date(dateTime).toISOString();
      const selectedActivityType =
        activity === "other"
          ? "other"
          : activity;
      const mergedDescription =
        activity === "other" && otherActivity.trim()
          ? lang === "pl"
            ? `Niestandardowa aktywność: ${otherActivity.trim()}${description.trim() ? `\n\n${description.trim()}` : ""}`
            : `Custom activity: ${otherActivity.trim()}${description.trim() ? `\n\n${description.trim()}` : ""}`
          : description.trim() || undefined;
      const payload: CreateSlotInput = {
        activity_type: selectedActivityType,
        title: title.trim(),
        description: mergedDescription || undefined,
        date_time: iso,
        location_name: locationName.trim(),
        location_lat: pickedPoint.lat,
        location_lng: pickedPoint.lng,
        max_spots: maxSpots,
        min_reliability: minRel / 100,
        min_level: minLevel,
        recurring,
        recurring_pattern: recurring ? pattern || null : null,
        gender_scope: genderScope,
      };
      const res = isEdit
        ? await updateSlotAction(edit!.slotId, payload)
        : await createSlotAction(payload);
      if ("error" in res && res.error) setError(res.error);
      else if (!isEdit && "id" in res && res.id) router.push(`/slots/${res.id}`);
      else if (isEdit && "ok" in res && res.ok) router.push(`/slots/${edit!.slotId}/manage`);
    } finally {
      setLoading(false);
    }
  }

  const previewDef = ACTIVITIES[activity];

  return (
    <div>
      <PageHeader
        title={isEdit ? t.headerEdit : t.header}
        backHref={isEdit ? `/slots/${edit!.slotId}/manage` : "/feed"}
        backLabel={isEdit ? t.backManage : pageHeaderUi(lang).back}
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <section>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {t.activityType}
          </h2>
          <p className="mb-2 text-sm text-[var(--text-muted)]">{t.top10Hint}</p>
          <div className="space-y-5">
            {ACTIVITY_GROUPS.map((group) => (
              <div key={group.titleKey}>
                <h3 className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {t[group.titleKey]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.keys.map((key) => {
                    const sel = activity === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActivity(key)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] ${
                          sel
                            ? "border-[var(--gold-bright)] bg-[var(--bg-panel)] text-[var(--text-primary)]"
                            : "border-[var(--gold-dim)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--gold-dark)] hover:bg-[var(--bg-card-hover)]"
                        }`}
                      >
                        <ActivityIcon activityType={key} size="sm" />
                        {activityLabel(lang, key)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {activity === "other" ? (
            <Input
              label={t.otherLabel}
              value={otherActivity}
              onChange={(e) => setOtherActivity(e.target.value)}
              placeholder={t.otherPlaceholder}
              required
            />
          ) : null}
        </section>

        <section>
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {t.audience}
          </h2>
          <div className="flex gap-2">
            {(
              [
                { key: "any" as const, icon: ICON_ANY, title: t.audienceAnyTitle },
                { key: "female" as const, icon: ICON_FEMALE, title: t.audienceWomenTitle },
                { key: "male" as const, icon: ICON_MALE, title: t.audienceMenTitle },
              ] as const
            ).map(({ key, icon, title }) => {
              const sel = genderScope === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={title}
                  aria-label={title}
                  onClick={() => setGenderScope(key)}
                  className={`flex min-h-[3rem] flex-1 items-center justify-center rounded-lg border font-mono text-2xl transition ${
                    sel
                      ? "border-[var(--gold-bright)] shadow-[var(--shadow-glow-gold)]"
                      : "border-[var(--gold-dim)] bg-[var(--bg-card)] hover:border-[var(--gold-dark)]"
                  }`}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </section>

        <Input label={t.title} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          label={t.datetime}
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          required
        />
        <Input
          label={t.locationName}
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          required
          placeholder={t.locationPlaceholder}
        />
        <div>
          <label className="mb-2 block font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            {t.pickOnMap}
          </label>
          <LocationPickerMap value={pickedPoint} onChange={setPickedPoint} />
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t.clickMapHint}</p>
        </div>

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
              onClick={() => setMaxSpots((n) => Math.min(8, n + 1))}
            >
              +
            </Button>
          </div>
        </div>

        <Textarea label={t.description} value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <label className="mb-1 block font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            {t.minReliability} ({minRel}%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={minRel}
            onChange={(e) => setMinRel(Number(e.target.value))}
            className="w-full accent-[var(--gold-mid)]"
          />
        </div>

        <div>
          <label className="mb-1 block font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            {t.minLevel}
          </label>
          <select
            value={minLevel}
            onChange={(e) => setMinLevel(Number(e.target.value))}
            className="input-wow w-full"
          >
            {Array.from({ length: 21 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="accent-[var(--gold-mid)]"
          />
          {t.recurring}
        </label>
        {recurring ? (
          <Input
            label={t.recurringPattern}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={t.recurringPlaceholder}
          />
        ) : null}

        {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? (isEdit ? t.savingQuest : t.publishing) : isEdit ? t.saveQuest : t.publish}
        </Button>
      </form>

      <section className="mt-10">
        <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {t.preview}
        </h3>
        <div
          className="wow-card rounded-lg p-4"
          style={{ borderTop: `2px solid ${previewDef.color}` }}
        >
          <div className="flex gap-3">
            <ActivityIcon activityType={activity} />
            <div>
              <p className="font-display text-lg text-[var(--text-bright)]">
                {title || t.previewTitle}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{activityLabel(lang, activity)}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                📍 {locationName || t.previewLocation}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
