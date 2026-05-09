import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  /** Defaults to English "← Back" if omitted */
  backLabel?: string;
  right?: ReactNode;
};

export function PageHeader({ title, backHref, backLabel = "← Back", right }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-3">
      {backHref ? (
        <Link
          href={backHref}
          className="font-display text-sm uppercase tracking-widest text-[var(--gold-mid)] hover:text-[var(--gold-bright)]"
        >
          {backLabel}
        </Link>
      ) : null}
      <h1 className="font-display flex-1 text-2xl font-bold text-[var(--text-bright)]">
        {title}
      </h1>
      {right}
    </header>
  );
}
