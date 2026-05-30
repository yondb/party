import { describe, expect, it } from "vitest";
import { cn, formatDate, formatTime, formatDistance } from "@/lib/utils";

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("formatDate / formatTime", () => {
  it("returns a dash for invalid dates instead of throwing", () => {
    expect(formatDate("not-a-date")).toBe("—");
    expect(formatTime("not-a-date")).toBe("—");
  });

  it("formats a valid date without throwing", () => {
    const out = formatDate(new Date(Date.UTC(2026, 0, 1, 12, 0, 0)));
    expect(typeof out).toBe("string");
    expect(out).not.toBe("—");
  });
});

describe("formatDistance", () => {
  it("uses meters below 1km", () => {
    expect(formatDistance(250)).toBe("250 m");
  });

  it("uses kilometers with one decimal at/above 1km", () => {
    expect(formatDistance(1500)).toBe("1.5 km");
  });
});
