export type ActivityKey =
  | "running"
  | "coffee"
  | "volleyball"
  | "cycling"
  | "boardgames"
  | "gym"
  | "hiking"
  | "walking"
  | "yoga"
  | "movies"
  | "food"
  | "study"
  | "padel"
  | "tennis"
  | "basketball"
  | "other";

export type ActivityDef = {
  label: string;
  icon: string;
  color: string;
  gradient: string;
  cssVar: string;
};

export const ACTIVITIES: Record<ActivityKey, ActivityDef> = {
  running: {
    label: "Running",
    icon: "🏃",
    color: "#FF6B35",
    gradient: "linear-gradient(135deg, #FF8A5C, #FF6B35)",
    cssVar: "var(--accent)",
  },
  coffee: {
    label: "Coffee",
    icon: "☕",
    color: "#B45309",
    gradient: "linear-gradient(135deg, #D97706, #B45309)",
    cssVar: "var(--accent)",
  },
  volleyball: {
    label: "Volleyball",
    icon: "🏐",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #60A5FA, #3B82F6)",
    cssVar: "var(--accent)",
  },
  cycling: {
    label: "Cycling",
    icon: "🚴",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #34D399, #10B981)",
    cssVar: "var(--accent)",
  },
  boardgames: {
    label: "Board games",
    icon: "♟️",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
    cssVar: "var(--accent)",
  },
  gym: {
    label: "Gym",
    icon: "💪",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #F87171, #EF4444)",
    cssVar: "var(--accent)",
  },
  hiking: {
    label: "Hiking",
    icon: "⛰️",
    color: "#84CC16",
    gradient: "linear-gradient(135deg, #A3E635, #84CC16)",
    cssVar: "var(--accent)",
  },
  walking: {
    label: "Walking",
    icon: "🚶",
    color: "#22C55E",
    gradient: "linear-gradient(135deg, #4ADE80, #22C55E)",
    cssVar: "var(--accent)",
  },
  yoga: {
    label: "Yoga",
    icon: "🧘",
    color: "#A855F7",
    gradient: "linear-gradient(135deg, #C084FC, #A855F7)",
    cssVar: "var(--accent)",
  },
  movies: {
    label: "Movies",
    icon: "🎬",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #818CF8, #6366F1)",
    cssVar: "var(--accent)",
  },
  food: {
    label: "Food",
    icon: "🍜",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #FBBF24, #F59E0B)",
    cssVar: "var(--accent)",
  },
  study: {
    label: "Study",
    icon: "📚",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
    cssVar: "var(--accent)",
  },
  padel: {
    label: "Padel",
    icon: "🎾",
    color: "#14B8A6",
    gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)",
    cssVar: "var(--accent)",
  },
  tennis: {
    label: "Tennis",
    icon: "🎾",
    color: "#65A30D",
    gradient: "linear-gradient(135deg, #84CC16, #65A30D)",
    cssVar: "var(--accent)",
  },
  basketball: {
    label: "Basketball",
    icon: "🏀",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #FB923C, #F97316)",
    cssVar: "var(--accent)",
  },
  other: {
    label: "Other",
    icon: "✨",
    color: "#64748B",
    gradient: "linear-gradient(135deg, #94A3B8, #64748B)",
    cssVar: "var(--accent)",
  },
};

export const ACTIVITY_KEYS = Object.keys(ACTIVITIES) as ActivityKey[];

/** Maps DB `activity_type` string to known key; unknown → `other`. */
export function normalizeActivityKey(raw: string): ActivityKey {
  if (raw in ACTIVITIES) return raw as ActivityKey;
  return "other";
}

export function getActivity(key: string): ActivityDef {
  const k = key as ActivityKey;
  return (
    ACTIVITIES[k] ?? {
      label: key,
      icon: "✨",
      color: "#64748B",
      gradient: "linear-gradient(135deg, #94A3B8, #64748B)",
      cssVar: "var(--accent)",
    }
  );
}
