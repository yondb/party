type AchievementBadgeProps = {
  icon: string;
  title: string;
  description: string;
};

export function AchievementBadge({ icon, title, description }: AchievementBadgeProps) {
  return (
    <span
      title={`${title}: ${description}`}
      className="inline-flex h-10 w-10 cursor-default items-center justify-center rounded border border-[var(--gold-dark)] bg-[var(--bg-panel)] text-lg shadow-[var(--shadow-card)] transition hover:border-[var(--gold-bright)] hover:shadow-[var(--shadow-glow-gold)]"
      role="img"
      aria-label={title}
    >
      {icon}
    </span>
  );
}
