"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSlotAction, updateSlotStatus } from "@/app/actions/slots";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { slotManageUi } from "@/lib/i18n-ui";

type HostManageToolbarProps = {
  slotId: string;
  /** Host may edit, cancel, or delete while quest is still active. */
  canMutate: boolean;
};

export function HostManageToolbar({ slotId, canMutate }: HostManageToolbarProps) {
  const { lang } = useLanguage();
  const m = slotManageUi(lang);
  const router = useRouter();
  const [busy, setBusy] = useState<null | "cancel" | "delete">(null);

  if (!canMutate) return null;

  async function onCancel() {
    if (!confirm(m.confirmCancel)) return;
    setBusy("cancel");
    try {
      const r = await updateSlotStatus(slotId, "cancelled");
      if ("error" in r && r.error) window.alert(r.error);
      else router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!confirm(m.confirmDelete)) return;
    setBusy("delete");
    try {
      const r = await deleteSlotAction(slotId);
      if ("error" in r && r.error) window.alert(r.error);
      else router.push("/feed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] p-4">
      <p className="mb-3 text-xs leading-snug text-[var(--text-muted)]">{m.toolbarHint}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={`/slots/${slotId}/edit`}
          className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--bg-panel)] px-4 text-center text-sm font-semibold text-[var(--accent)] transition hover:opacity-95 sm:min-w-[9rem]"
        >
          {m.editQuest}
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="flex-1 sm:min-w-[9rem]"
          disabled={busy !== null}
          onClick={() => void onCancel()}
        >
          {busy === "cancel" ? "…" : m.cancelQuest}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1 border-[var(--status-full)]/45 text-[var(--status-full)] sm:min-w-[9rem]"
          disabled={busy !== null}
          onClick={() => void onDelete()}
        >
          {busy === "delete" ? "…" : m.deleteQuest}
        </Button>
      </div>
    </section>
  );
}
