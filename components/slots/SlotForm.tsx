"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ACTIVITIES, ACTIVITY_KEYS, type ActivityKey } from "@/lib/activities";
import { createSlotAction } from "@/app/actions/slots";
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
    top10Hint: "Top 10 group activities + Other",
    audience: "Who can join",
    audienceAnyTitle: "Open to everyone",
    audienceWomenTitle: "Women only",
    audienceMenTitle: "Men only",
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
    top10Hint: "Top 10 wspólnych aktywności + Inne",
    audience: "Kto może dołączyć",
    audienceAnyTitle: "Wszyscy",
    audienceWomenTitle: "Tylko kobiety",
    audienceMenTitle: "Tylko mężczyźni",
  },
} as const;

function ActivityPickerTile({
  activityKey,
  label,
  selected,
  index,
  onSelect,
}: {
  activityKey: ActivityKey;
  label: string;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 rounded-xl border px-1.5 pb-2 pt-2.5 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] ${
        selected
          ? "border-[var(--gold-bright)] bg-[var(--bg-panel)] shadow-[inset_0_0_0_1px_rgba(240,192,64,0.2)]"
          : "border-[var(--gold-dim)] bg-[var(--bg-card)] hover:border-[var(--gold-dark)] hover:bg-[var(--bg-card-hover)]"
      }`}
    >
      <ActivityIcon activityType={activityKey} size="sm" />
      <span className="line-clamp-2 min-h-[2.25rem] w-full px-0.5 font-display text-[10px] font-semibold uppercase leading-tight tracking-[0.06em] text-[var(--text-secondary)] sm:text-[11px]">
        {label}
      </span>
    </motion.button>
  );
}

export function SlotForm() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityKey>("running");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [otherActivity, setOtherActivity] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number } | null>(
    DEFAULT_POINT,
  );
  const [maxSpots, setMaxSpots] = useState(4);
  const [minRel, setMinRel] = useState(0);
  const [minLevel, setMinLevel] = useState(0);
  const [recurring, setRecurring] = useState(false);
  const [pattern, setPattern] = useState("");
  const [genderScope, setGenderScope] = useState<"any" | "female" | "male">("any");
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
      const res = await createSlotAction({
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
      });
      if ("error" in res && res.error) setError(res.error);
      else if ("id" in res && res.id) router.push(`/slots/${res.id}`);
    } finally {
      setLoading(false);
    }
  }

  const previewDef = ACTIVITIES[activity];

  return (
    <div>
      <PageHeader title={t.header} backHref="/feed" backLabel={pageHeaderUi(lang).back} />
      <form onSubmit={onSubmit} className="space-y-6">
        <section>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {t.activityType}
          </h2>
          <p className="mb-2 text-sm text-[var(--text-muted)]">{t.top10Hint}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">
            {ACTIVITY_KEYS.map((key, i) => {
              const sel = activity === key;
              return (
                <ActivityPickerTile
                  key={key}
                  activityKey={key}
                  label={activityLabel(lang, key)}
                  selected={sel}
                  index={i}
                  onSelect={() => setActivity(key)}
                />
              );
            })}
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
          {loading ? t.publishing : t.publish}
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
