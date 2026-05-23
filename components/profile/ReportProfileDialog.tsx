"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { reportProfile } from "@/app/actions/reports";

const COPY = {
  en: {
    button: "Report profile",
    title: "Report this profile",
    hint: "Describe the issue (min. 10 characters). An admin will review it manually.",
    submit: "Submit report",
    cancel: "Cancel",
    sent: "Report sent. Thank you.",
  },
  pl: {
    button: "Zgłoś profil",
    title: "Zgłoś ten profil",
    hint: "Opisz problem (min. 10 znaków). Administrator oceni zgłoszenie ręcznie.",
    submit: "Wyślij zgłoszenie",
    cancel: "Anuluj",
    sent: "Zgłoszenie wysłane. Dziękujemy.",
  },
} as const;

export function ReportProfileDialog({ reportedUserId }: { reportedUserId: string }) {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await reportProfile(reportedUserId, reason);
      if (res.error) setError(res.error);
      else {
        setDone(true);
        setReason("");
        setTimeout(() => {
          setOpen(false);
          setDone(false);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4">
      {!open ? (
        <Button type="button" variant="secondary" className="!min-h-0 !py-2 !text-sm" onClick={() => setOpen(true)}>
          {t.button}
        </Button>
      ) : (
        <div className="card rounded-lg border border-[var(--border-medium)] p-4">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">
            {t.title}
          </p>
          {done ? (
            <p className="mt-3 text-sm text-[var(--status-open)]">{t.sent}</p>
          ) : (
            <>
              <div className="mt-3">
                <Textarea
                  label={t.hint}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              {error ? <p className="mt-2 text-sm text-[var(--status-full)]">{error}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="primary" disabled={loading} onClick={submit}>
                  {loading ? "…" : t.submit}
                </Button>
                <Button type="button" variant="secondary" disabled={loading} onClick={() => setOpen(false)}>
                  {t.cancel}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
