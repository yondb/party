type AchievementBadgeProps = {
  icon: string;
  title: string;
  description: string;
};

export function AchievementBadge({ icon, title, description }: AchievementBadgeProps) {
  const tip = `${title} — ${description}`;
  return (<span
      title={tip}
      className="group relative inline-flex h-12 w-12 cursor-help items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--bg-surface)] text-xl shadow-[var(--shadow-sm)] transition hover:border-[var(--accent)]"
      role="img"
      aria-label={tip}
    >
      {icon}
    </span>
  );
}
