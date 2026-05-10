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
          className="shrink-0 font-display text-sm font-semibold uppercase tracking-[0.1em] text-[var(--gold-mid)] hover:text-[var(--gold-bright)] sm:text-base"
        >
          {backLabel}
        </Link>
      ) : null}
      <h1 className="font-display flex-1 text-2xl font-bold leading-tight text-[var(--text-bright)] sm:text-3xl">
        {title}
      </h1>
      {right}
    </header>
  );
}
