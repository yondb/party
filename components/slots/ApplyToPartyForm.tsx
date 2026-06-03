"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { applyToSlot } from "@/app/actions/applications";
import { applyFormUi } from "@/lib/i18n-ui";

export function ApplyToPartyForm({ slotId }: { slotId: string }) {
  const t = applyFormUi();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await applyToSlot(slotId, msg.trim() || undefined);
      if (res.error) setError(res.error);
      else setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (<p className="rounded border border-[var(--status-pending)] bg-[var(--bg-input)] p-3 text-center text-sm text-[var(--text-secondary)]">
        {t.done}
      </p>
    );
  }

  return (<form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        label={t.messageLabel}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder={t.messagePlaceholder}
      />
      {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}
      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? t.sending : t.submit}
      </Button>
    </form>
  );
}
