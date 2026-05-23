type BadgeProps = {
  label: string;
  color?: string;
  className?: string;
};

export function Badge({ label, color = "var(--accent)", className = "" }: BadgeProps) {
  return (
    <span
      className={`badge badge-accent ${className}`}
      style={color !== "var(--accent)" ? { color, borderColor: color } : undefined}
    >
      {label}
    </span>
  );
}
