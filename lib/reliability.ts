/**
 * Reliability helpers — full weighted history can be moved to SQL later.
 * New users start at 1.0 (100%). No-show penalties are applied in ratings flow.
 */

export const NO_SHOW_RELIABILITY_HIT = 0.1;
export const MAX_NO_SHOWS_BEFORE_FLOOR = 5;
export const RELIABILITY_FLOOR_AFTER_NO_SHOWS = 0.5;

export function clampReliability(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Whether the user should be blocked from applying (7 days) — placeholder using profile flag later. */
export function shouldBlockApplications(_noShowCount: number): boolean {
  return _noShowCount >= 3;
}
