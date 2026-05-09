"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITIES, ACTIVITY_KEYS } from "@/lib/activities";
import { completeSetup } from "@/app/actions/setup";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { ICON_FEMALE, ICON_MALE } from "@/lib/i18n-ui";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAvatarSelected(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Avatar must be an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar file is too large (max 5MB).");
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
        setError("Unauthorized");
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
      });
      if (res.error) setError(res.error);
      else router.push("/feed");
    } finally {
      setLoading(false);
    }
  }

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl text-[var(--text-bright)]">Create your character</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Name, avatar and favorite activities.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div>
          <span className="mb-2 block font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            Gender
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
        <Input
          label="Date of birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <div>
          <label className="mb-1 block font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            Avatar (upload from disk)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onAvatarSelected(e.target.files?.[0] ?? null)}
            className="input-wow w-full file:mr-3 file:rounded file:border file:border-[var(--gold-dark)] file:bg-[var(--bg-card)] file:px-3 file:py-1 file:text-xs file:text-[var(--text-secondary)]"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {uploadingAvatar
              ? "Uploading avatar..."
              : avatarUrl
                ? "Avatar uploaded."
                : "Upload optional (max 5MB)."}
          </p>
        </div>

        <div>
          <p className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">Choose activities</p>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_KEYS.map((k) => {
              const a = ACTIVITIES[k];
              const on = selected.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(k)}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${on ? "border-[var(--gold-bright)] bg-[var(--bg-card-hover)]" : "border-[var(--gold-dim)] bg-[var(--bg-card)]"}`}
                >
                  <span className="mr-2">{a.icon}</span>{a.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}
        <Button type="submit" variant="primary" fullWidth disabled={loading || uploadingAvatar || selected.length === 0 || !birthDate}>
          {loading ? "Saving..." : "Enter the game"}
        </Button>
      </form>
    </div>
  );
}
