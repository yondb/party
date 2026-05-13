import { getActivity, normalizeActivityKey } from "@/lib/activities";
import { ActivityGlyph } from "@/components/activities/ActivityGlyph";

const boxPx = { sm: 36, md: 52, lg: 72 };
const glyphPx = { sm: 20, md: 28, lg: 38 };

type ActivityIconProps = {
  /** `slots.activity_type` or `ActivityKey`. */
  activityType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ActivityIcon({ activityType, size = "md", className = "" }: ActivityIconProps) {
  const def = getActivity(activityType);
  const key = normalizeActivityKey(activityType);
  const w = boxPx[size];
  const g = glyphPx[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md border border-[var(--gold-dim)] bg-[var(--bg-input)] ${className}`}
      style={{
        width: w,
        height: w,
        boxShadow: `inset 0 0 0 1px rgba(240,192,64,0.06), 0 0 16px ${def.color}33`,
      }}
      aria-hidden
    >
      <ActivityGlyph activityKey={key} size={g} className="text-[var(--gold-bright)]" />
    </div>
  );
}
