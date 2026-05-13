"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ACTIVITIES, ACTIVITY_KEYS, type ActivityKey } from "@/lib/activities";
import { ActivityIcon } from "@/components/slots/ActivityIcon";
import { ActivityGlyph } from "@/components/activities/ActivityGlyph";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { activityLabel } from "@/lib/i18n-ui";

const VARIANTS = [
  { id: 1, pl: "Chipy w poziomie", en: "Horizontal chips" },
  { id: 2, pl: "Lista wierszy", en: "Row list" },
  { id: 3, pl: "Szersze kafle 2 kolumny", en: "Wider 2-column tiles" },
  { id: 4, pl: "Same ikony + title", en: "Icons only + native title" },
  { id: 5, pl: "Popularne + „Więcej”", en: "Popular + “More” sheet" },
  { id: 6, pl: "Select natywny", en: "Native select" },
  { id: 7, pl: "Grupy kategorii", en: "Category groups" },
  { id: 8, pl: "Hero + mini siatka", en: "Hero + mini grid" },
  { id: 9, pl: "Płaskie minimalne", en: "Flat minimal" },
  { id: 10, pl: "Karuzela snap", en: "Snap carousel" },
] as const;

const POPULAR: ActivityKey[] = ["running", "coffee", "boardgames", "movies", "food"];

const GROUPS: { pl: string; en: string; keys: ActivityKey[] }[] = [
  {
    pl: "Ruch",
    en: "Movement",
    keys: ["running", "cycling", "hiking", "walking", "volleyball", "gym", "yoga"],
  },
  {
    pl: "Społeczne",
    en: "Social",
    keys: ["coffee", "boardgames", "movies", "food", "study"],
  },
  { pl: "Inne", en: "Other", keys: ["other"] },
];

export default function ActivityVariantsPreviewPage() {
  const { lang } = useLanguage();
  const t = lang === "pl";
  const label = (k: ActivityKey) => activityLabel(lang, k);

  const [v1, setV1] = useState<ActivityKey>("running");
  const [v2, setV2] = useState<ActivityKey>("coffee");
  const [v3, setV3] = useState<ActivityKey>("boardgames");
  const [v4, setV4] = useState<ActivityKey>("movies");
  const [v5Main, setV5Main] = useState<ActivityKey>("running");
  const [v5MoreOpen, setV5MoreOpen] = useState(false);
  const [v6, setV6] = useState<ActivityKey>("yoga");
  const [v7, setV7] = useState<ActivityKey>("gym");
  const [v8, setV8] = useState<ActivityKey>("food");
  const [v9, setV9] = useState<ActivityKey>("study");
  const [v10, setV10] = useState<ActivityKey>("walking");
  const carouselRef = useRef<HTMLDivElement>(null);

  const v5Rest = useMemo(
    () => ACTIVITY_KEYS.filter((k) => !POPULAR.includes(k)),
    [],
  );

  function scrollCarousel(dir: -1 | 1) {
    const el = carouselRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: dir * w * 0.72, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-16 pt-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-3xl px-4">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[var(--gold-mid)]">
          /dev/activity-variants
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t ? "Podgląd wyboru aktywności" : "Activity picker preview"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
          {t
            ? "10 wariantów UI — klikaj, żeby zobaczyć zachowanie. To nie zapisuje questa."
            : "10 UI variants — click around. This page does not create a quest."}
        </p>
        <Link
          href="/landing"
          className="mt-4 inline-block text-sm font-semibold text-[var(--gold-bright)] underline-offset-2 hover:underline"
        >
          ← {t ? "Wróć" : "Back"}
        </Link>

        <div className="mt-12 space-y-14">
          {VARIANTS.map((v) => (
            <section
              key={v.id}
              id={`v${v.id}`}
              className="rounded-2xl border border-[var(--gold-dim)] bg-[var(--bg-card)] p-4 shadow-lg sm:p-5"
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-mono text-xs text-[var(--text-muted)]">#{v.id}</span>
                <h2 className="font-display text-lg font-semibold">{t ? v.pl : v.en}</h2>
              </div>

              {v.id === 1 && (
                <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-1">
                  {ACTIVITY_KEYS.map((key) => {
                    const sel = v1 === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        title={label(key)}
                        onClick={() => setV1(key)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-left text-sm transition ${
                          sel
                            ? "border-[var(--gold-bright)] bg-[var(--bg-panel)] text-[var(--text-primary)]"
                            : "border-[var(--gold-dim)] bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:border-[var(--gold-dark)]"
                        }`}
                      >
                        <ActivityIcon activityType={key} size="sm" />
                        <span className="max-w-[7.5rem] truncate font-medium">{label(key)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {v.id === 2 && (
                <ul className="divide-y divide-[var(--gold-dim)]/40 rounded-xl border border-[var(--gold-dim)]/50">
                  {ACTIVITY_KEYS.map((key) => {
                    const sel = v2 === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => setV2(key)}
                          className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                            sel ? "bg-[var(--bg-panel)]" : "hover:bg-[var(--bg-card-hover)]"
                          }`}
                        >
                          <ActivityIcon activityType={key} size="md" />
                          <span className="flex-1 font-medium">{label(key)}</span>
                          <span className="text-[var(--text-muted)]">{sel ? "●" : "○"}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {v.id === 3 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ACTIVITY_KEYS.map((key) => {
                    const sel = v3 === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setV3(key)}
                        className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition ${
                          sel
                            ? "border-[var(--gold-bright)] bg-[var(--bg-panel)]"
                            : "border-[var(--gold-dim)] bg-[var(--bg-deep)] hover:border-[var(--gold-dark)]"
                        }`}
                      >
                        <ActivityIcon activityType={key} size="md" />
                        <span className="text-sm font-medium leading-snug text-[var(--text-primary)]">
                          {label(key)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {v.id === 4 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {ACTIVITY_KEYS.map((key) => {
                    const sel = v4 === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        title={label(key)}
                        aria-label={label(key)}
                        onClick={() => setV4(key)}
                        className={`rounded-2xl p-1 transition ${
                          sel ? "ring-2 ring-[var(--gold-bright)] ring-offset-2 ring-offset-[var(--bg-card)]" : ""
                        }`}
                      >
                        <ActivityIcon activityType={key} size="md" />
                      </button>
                    );
                  })}
                </div>
              )}

              {v.id === 5 && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR.map((key) => {
                      const sel = v5Main === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setV5Main(key);
                            setV5MoreOpen(false);
                          }}
                          className={`rounded-full border px-3 py-2 text-sm font-medium ${
                            sel
                              ? "border-[var(--gold-bright)] bg-[var(--bg-panel)]"
                              : "border-[var(--gold-dim)] hover:border-[var(--gold-dark)]"
                          }`}
                        >
                          {label(key)}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setV5MoreOpen((o) => !o)}
                      className="rounded-full border border-dashed border-[var(--gold-mid)] px-3 py-2 text-sm text-[var(--gold-bright)]"
                    >
                      {t ? "Więcej…" : "More…"}
                    </button>
                  </div>
                  {v5MoreOpen ? (
                    <div className="mt-3 rounded-xl border border-[var(--gold-dim)] bg-[var(--bg-deep)] p-3">
                      <p className="mb-2 text-xs text-[var(--text-muted)]">
                        {t ? "Reszta typów:" : "Rest of types:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {v5Rest.map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setV5Main(key);
                              setV5MoreOpen(false);
                            }}
                            className={`rounded-lg border px-2 py-1 text-sm ${
                              v5Main === key
                                ? "border-[var(--gold-bright)] bg-[var(--bg-panel)]"
                                : "border-[var(--gold-dim)]"
                            }`}
                          >
                            {label(key)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {t ? "Wybrane:" : "Selected:"}{" "}
                    <strong>{label(v5Main)}</strong>
                  </p>
                </div>
              )}

              {v.id === 6 && (
                <select
                  value={v6}
                  onChange={(e) => setV6(e.target.value as ActivityKey)}
                  className="input-wow w-full max-w-md"
                >
                  {ACTIVITY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {label(key)}
                    </option>
                  ))}
                </select>
              )}

              {v.id === 7 && (
                <div className="space-y-5">
                  {GROUPS.map((g) => (
                    <div key={g.pl}>
                      <h3 className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        {t ? g.pl : g.en}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {g.keys.map((key) => {
                          const sel = v7 === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setV7(key)}
                              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm ${
                                sel
                                  ? "border-[var(--gold-bright)] bg-[var(--bg-panel)]"
                                  : "border-[var(--gold-dim)] hover:border-[var(--gold-dark)]"
                              }`}
                            >
                              <ActivityIcon activityType={key} size="sm" />
                              {label(key)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {v.id === 8 && (
                <div>
                  <div className="mb-4 flex flex-col items-center rounded-2xl border border-[var(--gold-dim)] bg-[var(--bg-deep)] px-4 py-6">
                    <ActivityIcon activityType={v8} size="lg" />
                    <p className="mt-3 font-display text-xl font-semibold">{label(v8)}</p>
                    <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
                      {t ? "Wybierz inną ikonę poniżej." : "Pick another icon below."}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {ACTIVITY_KEYS.map((key) => {
                      const sel = v8 === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setV8(key)}
                          className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition ${
                            sel
                              ? "border-[var(--gold-bright)] bg-[var(--bg-panel)]"
                              : "border-transparent hover:border-[var(--gold-dim)]"
                          }`}
                        >
                          <ActivityIcon activityType={key} size="sm" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {v.id === 9 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {ACTIVITY_KEYS.map((key) => {
                    const def = ACTIVITIES[key];
                    const sel = v9 === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setV9(key)}
                        className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ${
                          sel
                            ? "border-[var(--gold-bright)] bg-[var(--bg-panel)]"
                            : "border-[var(--gold-dim)]/60 bg-[var(--bg-deep)] hover:border-[var(--gold-dim)]"
                        }`}
                        style={{
                          boxShadow: sel ? undefined : "inset 0 0 0 1px rgba(255,255,255,0.03)",
                        }}
                      >
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-lg"
                          style={{
                            background: `color-mix(in srgb, ${def.color} 25%, var(--bg-card))`,
                          }}
                        >
                          <ActivityGlyph
                            activityKey={key}
                            size={26}
                            className="text-[var(--gold-bright)]"
                          />
                        </div>
                        <span className="text-center text-[11px] font-medium leading-tight text-[var(--text-secondary)]">
                          {label(key)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {v.id === 10 && (
                <div>
                  <div className="mb-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => scrollCarousel(-1)}
                      className="rounded-lg border border-[var(--gold-dim)] px-2 py-1 text-xs"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel(1)}
                      className="rounded-lg border border-[var(--gold-dim)] px-2 py-1 text-xs"
                    >
                      →
                    </button>
                  </div>
                  <div
                    ref={carouselRef}
                    className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {ACTIVITY_KEYS.map((key) => {
                      const sel = v10 === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setV10(key)}
                          className={`w-[min(100%,18rem)] shrink-0 snap-center rounded-2xl border-2 p-4 text-left transition ${
                            sel
                              ? "border-[var(--gold-bright)] bg-[var(--bg-panel)]"
                              : "border-[var(--gold-dim)] bg-[var(--bg-deep)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ActivityIcon activityType={key} size="lg" />
                            <div>
                              <p className="font-display text-lg font-semibold">{label(key)}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {t ? "Dotknij, aby wybrać" : "Tap to select"}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {t ? "Wybrane:" : "Selected:"} <strong>{label(v10)}</strong>
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
