import { describe, expect, it } from "vitest";
import {
  getLevelFromExp,
  getNextLevelRow,
  getExpToNextLevel,
  getLevelProgress,
  getTitleForExp,
} from "@/lib/exp";

describe("getLevelFromExp", () => {
  it("returns level 1 at 0 XP", () => {
    expect(getLevelFromExp(0).level).toBe(1);
  });

  it("stays at level 1 just below the next threshold", () => {
    expect(getLevelFromExp(299).level).toBe(1);
  });

  it("advances exactly at a threshold", () => {
    expect(getLevelFromExp(300).level).toBe(2);
    expect(getLevelFromExp(800).level).toBe(3);
  });

  it("caps at the max defined level", () => {
    expect(getLevelFromExp(80_000).level).toBe(20);
    expect(getLevelFromExp(10_000_000).level).toBe(20);
  });
});

describe("getNextLevelRow", () => {
  it("points to the next band when not maxed", () => {
    expect(getNextLevelRow(0)?.level).toBe(2);
    expect(getNextLevelRow(0)?.expRequired).toBe(300);
  });

  it("returns null at the max level", () => {
    expect(getNextLevelRow(80_000)).toBeNull();
  });
});

describe("getExpToNextLevel", () => {
  it("returns the delta to the next threshold", () => {
    expect(getExpToNextLevel(0)).toBe(300);
    expect(getExpToNextLevel(100)).toBe(200);
  });

  it("returns 0 at the max level", () => {
    expect(getExpToNextLevel(80_000)).toBe(0);
  });
});

describe("getLevelProgress", () => {
  it("is 0 at the start of a band", () => {
    expect(getLevelProgress(0)).toBe(0);
  });

  it("is 0.5 halfway through the first band", () => {
    expect(getLevelProgress(150)).toBeCloseTo(0.5, 5);
  });

  it("is clamped to 1 at the max level", () => {
    expect(getLevelProgress(80_000)).toBe(1);
  });
});

describe("getTitleForExp", () => {
  it("maps XP to the band title", () => {
    expect(getTitleForExp(0)).toBe("Newcomer");
    expect(getTitleForExp(300)).toBe("Wanderer");
    expect(getTitleForExp(80_000)).toBe("Mythic");
  });
});
