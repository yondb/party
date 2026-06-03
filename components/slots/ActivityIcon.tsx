import { getActivity, normalizeActivityKey } from "@/lib/activities";
import { ActivityGlyph } from "@/components/activities/ActivityGlyph";

const boxPx = { sm: 40, md: 56, lg: 76 };
const glyphPx = { sm: 22, md: 30, lg: 42 };

function colorWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return `rgba(232, 130, 26, ${alpha})`;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

type ActivityIconProps = {
  activityType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ActivityIcon({ activityType, size = "md", className = "" }: ActivityIconProps) {
  const def = getActivity(activityType);
  const key = normalizeActivityKey(activityType);
  const w = boxPx[size];
  const g = glyphPx[size];

  return (<div
      className={`relative flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: w,
        height: w,
        borderRadius: "var(--radius-md)",
        background: colorWithAlpha(def.color, 0.12),
      }}
      aria-hidden
    >
      <div className="relative z-[1]" style={{ color: def.color }}>
        <ActivityGlyph activityKey={key} size={g} />
      </div>
    </div>
  );
}
