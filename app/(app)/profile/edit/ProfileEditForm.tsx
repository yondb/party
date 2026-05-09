"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { ICON_FEMALE, ICON_MALE } from "@/lib/i18n-ui";

export function ProfileEditForm({
  initialName,
  initialBio,
  initialGender,
  initialBirthDate,
  initialAvatarUrl,
}: {
  initialName: string;
  initialBio: string | null;
  initialGender: "male" | "female";
  initialBirthDate: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio ?? "");
  const [gender, setGender] = useState(initialGender);
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
    setError(null);
    setLoading(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
        gender,
        birth_date: birthDate,
        avatar_url: avatarUrl.trim() || null,
      });
      if (res.error) setError(res.error);
      else router.push("/profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Imię" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
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
              : "No avatar uploaded yet."}
        </p>
      </div>
      {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}
      <Button type="submit" variant="primary" fullWidth disabled={loading || uploadingAvatar || !birthDate}>
        {loading ? "Zapis…" : "Zapisz"}
      </Button>
    </form>
  );
}
