import { describe, expect, it } from "vitest";
import { normalizeActivityKey, ACTIVITY_KEYS } from "@/lib/activities";

describe("normalizeActivityKey", () => {
  it("returns known keys unchanged", () => {
    for (const k of ACTIVITY_KEYS) {
      if (k === "walking") continue;
      expect(normalizeActivityKey(k)).toBe(k);
    }
    expect(normalizeActivityKey("walking")).toBe("dog_walk");
  });

  it("maps place categories padel, tennis, basketball", () => {
    expect(normalizeActivityKey("padel")).toBe("padel");
    expect(normalizeActivityKey("tennis")).toBe("tennis");
    expect(normalizeActivityKey("basketball")).toBe("basketball");
  });

  it("maps unknown values to other", () => {
    expect(normalizeActivityKey("unknown-quest-type")).toBe("other");
    expect(normalizeActivityKey("")).toBe("other");
  });
});
