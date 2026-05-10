type StatBlockProps = {
  label: string;
  value: string | number;
};

export function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="flex min-h-[5.75rem] flex-col items-center justify-center rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] px-3 py-4 sm:min-h-[6.25rem] sm:px-4">
      <span className="font-display text-3xl font-bold leading-none tabular-nums text-[var(--gold-bright)] sm:text-[2rem]">
        {value}
      </span>
      <span className="mt-3 text-center font-display text-base uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
  );
}
