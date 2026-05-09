import type { ActivityDef } from "@/lib/activities";

type ActivityIconProps = {
  activity: ActivityDef;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = { sm: "text-xl", md: "text-3xl", lg: "text-5xl" };

export function ActivityIcon({ activity, size = "md", className = "" }: ActivityIconProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md border border-[var(--gold-dim)] ${sizes[size]} ${className}`}
      style={{
        background: activity.gradient,
        width: size === "lg" ? 72 : size === "md" ? 52 : 36,
        height: size === "lg" ? 72 : size === "md" ? 52 : 36,
      }}
      aria-hidden
    >
      <span>{activity.icon}</span>
    </div>
  );
}
