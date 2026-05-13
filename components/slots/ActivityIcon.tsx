import { getActivity, normalizeActivityKey } from "@/lib/activities";
import { ActivityGlyph } from "@/components/activities/ActivityGlyph";

const boxPx = { sm: 40, md: 56, lg: 76 };
const glyphPx = { sm: 22, md: 30, lg: 42 };

function colorWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return `rgba(201, 150, 58, ${alpha})`;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

type ActivityIconProps = {
  /** `slots.activity_type` or `ActivityKey`. */
  activityType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Activity mark: soft medal (gradient + class tint), not a flat “inventory tile”. */
export function ActivityIcon({ activityType, size = "md", className = "" }: ActivityIconProps) {
  const def = getActivity(activityType);
  const key = normalizeActivityKey(activityType);
  const w = boxPx[size];
  const g = glyphPx[size];
  const accent = colorWithAlpha(def.color, 0.42);
  const glow = colorWithAlpha(def.color, 0.22);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{
        width: w,
        height: w,
        background: `radial-gradient(100% 90% at 35% 0%, ${glow} 0%, transparent 52%), linear-gradient(165deg, rgba(28,22,14,0.98) 0%, rgba(8,7,5,1) 100%)`,
        boxShadow: `
          0 0 0 1px ${accent},
          0 3px 14px rgba(0,0,0,0.55),
          inset 0 1px 0 rgba(255, 230, 190, 0.06)
        `,
      }}
      aria-hidden
    >
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/45 to-transparent"
        aria-hidden
      />
      <ActivityGlyph
        activityKey={key}
        size={g}
        className="relative z-[1] text-[var(--gold-bright)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
      />
    </div>
  );
}
