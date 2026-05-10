type AchievementBadgeProps = {
  icon: string;
  title: string;
  description: string;
};

export function AchievementBadge({ icon, title, description }: AchievementBadgeProps) {
  return (
    <span
      title={`${title}: ${description}`}
      className="inline-flex h-12 w-12 cursor-default items-center justify-center rounded border border-[var(--gold-dark)] bg-[var(--bg-panel)] text-xl shadow-[var(--shadow-card)] transition hover:border-[var(--gold-bright)] hover:shadow-[var(--shadow-glow-gold)]"
      role="img"
      aria-label={title}
    >
      {icon}
    </span>
  );
}
