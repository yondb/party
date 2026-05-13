"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_KEYS } from "@/lib/activities";
import { completeSetup } from "@/app/actions/setup";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { ICON_FEMALE, ICON_MALE, activityLabel } from "@/lib/i18n-ui";
import { ActivityIcon } from "@/components/slots/ActivityIcon";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const STORAGE_GOALS = "pf_onboarding_goals";
const STORAGE_CITY = "pf_onboarding_city";

export default function SetupPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [homeCity, setHomeCity] = useState("");
  const [questGoals, setQuestGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const g = window.sessionStorage.getItem(STORAGE_GOALS);
      const c = window.sessionStorage.getItem(STORAGE_CITY);
      if (g) setQuestGoals(g);
      if (c) setHomeCity(c);
    } catch {
      // noop
    }
  }, []);

  const copy =
    lang === "pl"
      ? {
          title: "Stwórz postać",
          subtitle: "Imię, awatar i ulubione aktywności.",
          name: "Imię",
          gender: "Płeć",
          birth: "Data urodzenia",
          avatar: "Awatar (z dysku)",
          uploadBusy: "Przesyłanie awatara…",
          avatarOk: "Awatar przesłany.",
          avatarHint: "Opcjonalnie (max 5 MB).",
          activities: "Wybierz aktywności",
          cityLabel: "Miasto / okolica (opcjonalnie)",
          goalsLabel: "Cele (opcjonalnie)",
          cityPh: "Np. Kraków",
          goalsPh: "Np. regularne bieganie",
          submit: "Wejdź do gry",
          saving: "Zapisywanie…",
          imgErr: "Awatar musi być obrazem.",
          bigErr: "Plik za duży (max 5 MB).",
          unauth: "Brak autoryzacji",
        }
      : {
          title: "Create your character",
          subtitle: "Name, avatar and favorite activities.",
          name: "Name",
          gender: "Gender",
          birth: "Date of birth",
          avatar: "Avatar (upload from disk)",
          uploadBusy: "Uploading avatar…",
          avatarOk: "Avatar uploaded.",
          avatarHint: "Optional (max 5MB).",
          activities: "Choose activities",
          cityLabel: "City / area (optional)",
          goalsLabel: "Goals (optional)",
          cityPh: "E.g. Berlin",
          goalsPh: "E.g. weekly volleyball",
          submit: "Enter the game",
          saving: "Saving…",
          imgErr: "Avatar must be an image file.",
          bigErr: "Avatar file is too large (max 5MB).",
          unauth: "Unauthorized",
        };

  async function onAvatarSelected(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(copy.imgErr);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(copy.bigErr);
      return;
    }

    setError(null);
    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError(copy.unauth);
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}-avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (uploadErr) {
        setError(uploadErr.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await completeSetup({
        name,
        gender,
        birth_date: birthDate,
        avatar_url: avatarUrl || null,
        preferred_activities: selected,
        home_city: homeCity.trim() || null,
        quest_goals: questGoals.trim() || null,
      });
      if (res.error) setError(res.error);
      else {
        try {
          window.sessionStorage.removeItem(STORAGE_GOALS);
          window.sessionStorage.removeItem(STORAGE_CITY);
        } catch {
          // noop
        }
        router.push("/feed");
      }
    } finally {
      setLoading(false);
    }
  }

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl text-[var(--text-bright)]">{copy.title}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{copy.subtitle}</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <Input label={copy.name} value={name} onChange={(e) => setName(e.target.value)} required />
        <div>
          <span className="mb-2 block font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            {copy.gender}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Female"
              title="Female"
              onClick={() => setGender("female")}
              className={`flex min-h-[3rem] flex-1 items-center justify-center rounded-lg border font-mono text-2xl transition ${
                gender === "female"
                  ? "border-[var(--gold-bright)] shadow-[var(--shadow-glow-gold)]"
                  : "border-[var(--gold-dim)] bg-[var(--bg-card)] hover:border-[var(--gold-dark)]"
              }`}
            >
              {ICON_FEMALE}
            </button>
            <button
              type="button"
              aria-label="Male"
              title="Male"
              onClick={() => setGender("male")}
              className={`flex min-h-[3rem] flex-1 items-center justify-center rounded-lg border font-mono text-2xl transition ${
                gender === "male"
                  ? "border-[var(--gold-bright)] shadow-[var(--shadow-glow-gold)]"
                  : "border-[var(--gold-dim)] bg-[var(--bg-card)] hover:border-[var(--gold-dark)]"
              }`}
            >
              {ICON_MALE}
            </button>
          </div>
        </div>
        <Input label={copy.birth} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
        <div>
          <label className="mb-1 block font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            {copy.avatar}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onAvatarSelected(e.target.files?.[0] ?? null)}
            className="input-wow w-full file:mr-3 file:rounded file:border file:border-[var(--gold-dark)] file:bg-[var(--bg-card)] file:px-3 file:py-1 file:text-xs file:text-[var(--text-secondary)]"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {uploadingAvatar ? copy.uploadBusy : avatarUrl ? copy.avatarOk : copy.avatarHint}
          </p>
        </div>

        <Input
          label={copy.cityLabel}
          value={homeCity}
          onChange={(e) => setHomeCity(e.target.value)}
          placeholder={copy.cityPh}
        />
        <div>
          <label className="mb-1 block font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            {copy.goalsLabel}
          </label>
          <textarea
            className="input-wow min-h-[4rem] w-full resize-y rounded-md border border-[var(--gold-dim)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)]"
            placeholder={copy.goalsPh}
            value={questGoals}
            onChange={(e) => setQuestGoals(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">{copy.activities}</p>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_KEYS.map((k) => {
              const on = selected.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(k)}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition ${
                    on ? "border-[var(--gold-bright)] bg-[var(--bg-card-hover)]" : "border-[var(--gold-dim)] bg-[var(--bg-card)] hover:border-[var(--gold-dark)]"
                  }`}
                >
                  <ActivityIcon activityType={k} size="sm" />
                  <span className="min-w-0 flex-1 leading-snug text-[var(--text-primary)]">{activityLabel(lang, k)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}
        <Button type="submit" variant="primary" fullWidth disabled={loading || uploadingAvatar || selected.length === 0 || !birthDate}>
          {loading ? copy.saving : copy.submit}
        </Button>
      </form>
    </div>
  );
}
