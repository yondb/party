"use client";

import { useMemo, useState } from "react";
import {
  PLACE_CATEGORY_META,
  placeCategoryLabel,
  type PlaceCategory,
  type PlaceRow,
} from "@/lib/places";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Input } from "@/components/ui/Input";

type PlacePickerProps = {
  places: PlaceRow[];
  value: PlaceRow | null;
  onChange: (place: PlaceRow) => void;
};

export function PlacePicker({ places, value, onChange }: PlacePickerProps) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? places.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.district?.toLowerCase().includes(q) ?? false) ||
            placeCategoryLabel(lang, p.category as PlaceCategory).toLowerCase().includes(q),
        )
      : places;
    const seen = new Set<string>();
    const deduped: PlaceRow[] = [];
    for (const p of list) {
      const key = `${p.category}:${p.name.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(p);
      if (deduped.length >= 80) break;
    }
    if (value && !deduped.some((p) => p.id === value.id)) {
      return [value, ...deduped].slice(0, 80);
    }
    return deduped;
  }, [places, query, lang, value]);

  return (
    <div className="space-y-3">
      <Input
        label={lang === "pl" ? "Szukaj miejsca" : "Search place"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={lang === "pl" ? "np. Łazienki…" : "e.g. Royal Baths…"}
      />
      <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-[var(--border-medium)] p-2">
        {filtered.length === 0 ? (
          <li className="px-2 py-4 text-center text-sm text-[var(--text-muted)]">
            {lang === "pl" ? "Brak miejsc — uruchom import OSM." : "No places — run OSM import."}
          </li>
        ) : (
          filtered.map((p) => {
            const meta = PLACE_CATEGORY_META[p.category as PlaceCategory];
            const selected = value?.id === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onChange(p)}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-transparent hover:border-[var(--border-medium)] hover:bg-[var(--bg-card)]"
                  }`}
                >
                  <span className="text-xl leading-none">{meta.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm font-semibold text-[var(--text-primary)]">
                      {p.name}
                    </span>
                    <span className="block text-xs text-[var(--text-muted)]">
                      {placeCategoryLabel(lang, p.category as PlaceCategory)}
                      {p.district ? ` · ${p.district}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
