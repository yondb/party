export const EXP_REWARDS = {
  ACTIVITY_COMPLETED_PARTICIPANT: 100,
  ACTIVITY_COMPLETED_HOST: 150,
  PERFECT_RATING_BONUS: 50,
  WEEKLY_STREAK_BONUS: 200,
  FIRST_OF_TYPE_BONUS: 300,
  NO_SHOW_PENALTY: -200,
  BAD_RATING_PENALTY: -100,
} as const;

export const QUEST_EXP = {
  SHOW_UP_TASK_BONUS: 30,
  SHOW_UP_TASK_FAIL: -60,
  TEAMWORK_TASK_BONUS: 40, // rating >= 4
  TEAMWORK_TASK_FAIL: -30, // rating <= 2
  LOYAL_DUO_BONUS: 120, // earned once when reaching 5 activities with same person
  HOST_CLEAN_RUN_BONUS: 80, // all participants showed up
  HOST_MESSY_RUN_PENALTY: -60, // at least one no-show
} as const;

export type LevelRow = { level: number; expRequired: number; title: string };

export const LEVELS: LevelRow[] = [
  { level: 1, expRequired: 0, title: "Newcomer" },
  { level: 2, expRequired: 300, title: "Wanderer" },
  { level: 3, expRequired: 800, title: "Adventurer" },
  { level: 4, expRequired: 1500, title: "Seasoned Adventurer" },
  { level: 5, expRequired: 2500, title: "Veteran" },
  { level: 6, expRequired: 4000, title: "Elite" },
  { level: 7, expRequired: 5500, title: "Elite II" },
  { level: 8, expRequired: 8000, title: "Trusted" },
  { level: 9, expRequired: 11000, title: "Trusted II" },
  { level: 10, expRequired: 15000, title: "Champion" },
  { level: 11, expRequired: 19000, title: "Champion II" },
  { level: 12, expRequired: 25000, title: "Hero" },
  { level: 13, expRequired: 32000, title: "Hero II" },
  { level: 14, expRequired: 36000, title: "Paragon" },
  { level: 15, expRequired: 40000, title: "Legend" },
  { level: 16, expRequired: 48000, title: "Legend II" },
  { level: 17, expRequired: 56000, title: "Ascendant" },
  { level: 18, expRequired: 64000, title: "Ascendant II" },
  { level: 19, expRequired: 72000, title: "Mythic" },
  { level: 20, expRequired: 80000, title: "Mythic" },
];

export function getLevelFromExp(exp: number): LevelRow {
  let current = LEVELS[0];
  for (const row of LEVELS) {
    if (exp >= row.expRequired) current = row;
    else break;
  }
  return current;
}

export function getNextLevelRow(exp: number): LevelRow | null {
  const cur = getLevelFromExp(exp);
  const idx = LEVELS.findIndex((r) => r.level === cur.level);
  return LEVELS[idx + 1] ?? null;
}

/** EXP needed to finish the current level band (delta to next threshold). */
export function getExpToNextLevel(exp: number): number {
  const next = getNextLevelRow(exp);
  if (!next) return 0;
  return Math.max(0, next.expRequired - exp);
}

/** Fill ratio within current level toward next threshold (0–1). */
export function getLevelProgress(exp: number): number {
  const cur = getLevelFromExp(exp);
  const next = getNextLevelRow(exp);
  if (!next) return 1;
  const span = next.expRequired - cur.expRequired;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (exp - cur.expRequired) / span));
}

export function getTitleForExp(exp: number): string {
  return getLevelFromExp(exp).title;
}
