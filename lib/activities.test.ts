import { describe, expect, it } from "vitest";
import { normalizeActivityKey, ACTIVITY_KEYS } from "@/lib/activities";

describe("normalizeActivityKey", () => {
  it("returns known keys unchanged", () => {
    for (const k of ACTIVITY_KEYS) {
      expect(normalizeActivityKey(k)).toBe(k);
    }
  });

  it("maps unknown values to other", () => {
    expect(normalizeActivityKey("unknown-quest-type")).toBe("other");
    expect(normalizeActivityKey("")).toBe("other");
  });
});
