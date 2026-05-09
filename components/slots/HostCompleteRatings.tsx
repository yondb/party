"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { submitSlotRatings, type RatingInput } from "@/app/actions/ratings";

type Participant = { id: string; name: string };

export function HostCompleteRatings({
  slotId,
  participants,
}: {
  slotId: string;
  participants: Participant[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, { score: number; showed_up: boolean; comment: string }>>(
    () =>
      Object.fromEntries(
        participants.map((p) => [p.id, { score: 5, showed_up: true, comment: "" }]),
      ),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const ratings: RatingInput[] = participants.map((p) => ({
        rated_id: p.id,
        score: rows[p.id]?.score ?? 5,
        showed_up: rows[p.id]?.showed_up ?? true,
        comment: rows[p.id]?.comment || null,
      }));
      const res = await submitSlotRatings(slotId, ratings);
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (participants.length === 0) return null;

  return (
    <div className="mt-6">
      {!open ? (
        <Button type="button" variant="primary" fullWidth onClick={() => setOpen(true)}>
          Zakończ quest (oceny)
        </Button>
      ) : (
        <div className="wow-card space-y-4 rounded-lg p-4">
          <p className="font-display text-sm text-[var(--text-bright)]">Oceń uczestników</p>
          {participants.map((p) => (
            <div key={p.id} className="rounded border border-[var(--gold-dim)] p-3">
              <p className="font-display text-[var(--gold-bright)]">{p.name}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-[var(--text-muted)]">
                  Ocena 1–5
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
                  Obecny
                </label>
              </div>
              <label className="mt-2 block text-xs text-[var(--text-muted)]">
                Komentarz
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
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button type="button" variant="primary" className="flex-1" disabled={loading} onClick={submit}>
              {loading ? "…" : "Zapisz i zamknij quest"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
