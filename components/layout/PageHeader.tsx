import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  /** Muted line under the title (e.g. context for chat screens). */
  subtitle?: string;
  backHref?: string;
  /** Defaults to English "← Back" if omitted */
  backLabel?: string;
  right?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "← Back",
  right,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3">
      {backHref ? (
        <Link
          href={backHref}
          className="shrink-0 self-center font-display text-sm font-semibold uppercase tracking-[0.1em] text-[var(--gold-mid)] hover:text-[var(--gold-bright)] sm:text-base"
        >
          {backLabel}
        </Link>
      ) : null}
      <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
        <h1 className="break-words font-display text-2xl font-bold leading-tight text-[var(--text-bright)] sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-prose text-sm leading-snug text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="ml-auto shrink-0 sm:ml-0">{right}</div> : null}
    </header>
  );
}
