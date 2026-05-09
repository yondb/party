type BadgeProps = {
  label: string;
  color?: string;
  className?: string;
};

export function Badge({ label, color = "var(--gold-mid)", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-widest ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  );
}
