type StatBlockProps = {
  label: string;
  value: string | number;
};

export function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="flex flex-col items-center rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] px-3 py-2">
      <span className="font-display text-xl font-bold text-[var(--gold-bright)]">{value}</span>
      <span className="text-center text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  );
}
