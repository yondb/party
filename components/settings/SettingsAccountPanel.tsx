"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { updateNotificationPrefs } from "@/app/actions/settings-prefs";
import { deleteOwnAccount, exportUserDataJson } from "@/app/actions/account-gdpr";
import { createClient } from "@/lib/supabase/client";
import type { Lang } from "@/lib/i18n-lang";
import { settingsUi } from "@/lib/i18n-ui";
import { DEFAULT_SUPPORT_EMAIL } from "@/lib/site";

export function SettingsAccountPanel({
  lang,
  initialEmailTransactional,
  initialMarketing,
}: {
  lang: Lang;
  initialEmailTransactional: boolean;
  initialMarketing: boolean;
}) {
  const t = settingsUi(lang);
  const router = useRouter();
  const toast = useToast();
  const [emailOn, setEmailOn] = useState(initialEmailTransactional);
  const [marketing, setMarketing] = useState(initialMarketing);
  const [busy, setBusy] = useState<null | "prefs" | "export" | "delete">(null);

  async function savePrefs() {
    setBusy("prefs");
    try {
      const res = await updateNotificationPrefs({
        email_transactional: emailOn,
        marketing_opt_in: marketing,
      });
      if ("error" in res && res.error) toast.push(res.error, "error");
      else toast.push(lang === "pl" ? "Zapisano." : "Saved.", "success");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function onExport() {
    setBusy("export");
    try {
      const res = await exportUserDataJson();
      if (!res.ok) {
        toast.push(res.error, "error");
        return;
      }
      const blob = new Blob([res.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.push(lang === "pl" ? "Pobrano plik." : "Download started.", "success");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    const sure = window.confirm(
      lang === "pl"
        ? "Na pewno usunąć konto? Tej operacji nie cofniesz."
        : "Permanently delete your account? This cannot be undone.",
    );
    if (!sure) return;
    setBusy("delete");
    try {
      const res = await deleteOwnAccount();
      if (!res.ok) {
        if (res.error === "no_service_role") {
          toast.push(
            lang === "pl"
              ? "Brak SUPABASE_SERVICE_ROLE_KEY — skonfiguruj serwer lub usuń konto z panelu Supabase."
              : "Missing SUPABASE_SERVICE_ROLE_KEY — configure the server or delete the account in Supabase.",
            "error",
          );
        } else {
          toast.push(res.error, "error");
        }
        return;
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/landing";
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="card rounded-lg p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{t.notifyHeading}</h2>
        <p className="mt-2 text-xs text-[var(--text-muted)]">{t.notifyEmailHint}</p>
        <label className="mt-3 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <input type="checkbox" checked={emailOn} onChange={(e) => setEmailOn(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          {t.notifyEmail}
        </label>
        <label className="mt-2 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          {t.marketingOptIn}
        </label>
        <Button type="button" variant="primary" className="mt-4" fullWidth disabled={busy !== null} onClick={() => void savePrefs()}>
          {busy === "prefs" ? "…" : lang === "pl" ? "Zapisz preferencje" : "Save preferences"}
        </Button>
      </section>

      <section className="card rounded-lg p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{t.dataHeading}</h2>
        <div className="mt-3 flex flex-col gap-2">
          <Button type="button" variant="secondary" fullWidth disabled={busy !== null} onClick={() => void onExport()}>
            {busy === "export" ? "…" : t.exportButton}
          </Button>
          <Button type="button" variant="secondary" fullWidth disabled={busy !== null} onClick={() => void onDelete()}>
            {busy === "delete" ? "…" : t.deleteButton}
          </Button>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">{t.deleteHint}</p>
      </section>

      <section className="card rounded-lg p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{t.supportHeading}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t.supportBody}</p>
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? DEFAULT_SUPPORT_EMAIL}`}
          className="mt-2 inline-block text-sm text-[var(--accent)] hover:text-[var(--accent)]"
        >
          {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? DEFAULT_SUPPORT_EMAIL}
        </a>
      </section>

      <section className="card rounded-lg p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{t.legalHeading}</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <Link href="/legal/privacy" className="text-[var(--accent)] hover:text-[var(--accent)]">
            {lang === "pl" ? "Polityka prywatności" : "Privacy policy"}
          </Link>
          <Link href="/legal/terms" className="text-[var(--accent)] hover:text-[var(--accent)]">
            {lang === "pl" ? "Regulamin" : "Terms of use"}
          </Link>
          <Link href="/premium" className="text-[var(--accent)] hover:text-[var(--accent)]">
            {t.premiumLink}
          </Link>
        </div>
      </section>

      <p className="text-center text-xs text-[var(--text-muted)]">{t.stagingNote}</p>
    </div>
  );
}
