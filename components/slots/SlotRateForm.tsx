"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { submitMyRatings, type RatingInput } from "@/app/actions/ratings";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { slotRateUi } from "@/lib/i18n-ui";

type Peer = { id: string; name: string };

export function SlotRateForm({ slotId, peers }: { slotId: string; peers: Peer[] }) {
  const { lang } = useLanguage();
  const t = slotRateUi(lang);
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, { score: number; showed_up: boolean; comment: string }>>(
    () =>
      Object.fromEntries(peers.map((p) => [p.id, { score: 5, showed_up: true, comment: "" }])),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const ratings: RatingInput[] = peers.map((p) => ({
        rated_id: p.id,
        score: rows[p.id]?.score ?? 5,
        showed_up: rows[p.id]?.showed_up ?? true,
        comment: rows[p.id]?.comment || null,
      }));
      const res = await submitMyRatings(slotId, ratings);
      if (res.error) setError(res.error);
      else router.push("/profile");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (peers.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">{t.noPeers}</p>;
  }

  return (
    <div className="wow-card space-y-4 rounded-lg p-4">
      <p className="font-display text-sm text-[var(--text-bright)]">{t.title}</p>
      {peers.map((p) => (
        <div key={p.id} className="rounded border border-[var(--gold-dim)] p-3">
          <p className="font-display text-[var(--gold-bright)]">{p.name}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-[var(--text-muted)]">
              {t.scoreLabel}
              <input
                type="number"
                min={1}
                max={5}
                className="input-wow mt-1"
                value={rows[p.id]?.score ?? 5}
                onChange={(e) =>
                  setRows((prev) => ({
                    ...prev,
                    [p.id]: { ...prev[p.id], score: Number(e.target.value) },
                  }))
                }
              />
            </label>
            <label className="flex items-end gap-2 pb-1 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={rows[p.id]?.showed_up ?? true}
                onChange={(e) =>
                  setRows((prev) => ({
                    ...prev,
                    [p.id]: { ...prev[p.id], showed_up: e.target.checked },
                  }))
                }
                className="accent-[var(--gold-mid)]"
              />
              {t.showedUp}
            </label>
          </div>
          <label className="mt-2 block text-xs text-[var(--text-muted)]">
            {t.comment}
            <input
              className="input-wow mt-1 w-full"
              value={rows[p.id]?.comment ?? ""}
              onChange={(e) =>
                setRows((prev) => ({
                  ...prev,
                  [p.id]: { ...prev[p.id], comment: e.target.value },
                }))
              }
            />
          </label>
        </div>
      ))}
      {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}
      <Button type="button" variant="primary" fullWidth disabled={loading} onClick={() => void submit()}>
        {loading ? t.saving : t.submit}
      </Button>
    </div>
  );
}
