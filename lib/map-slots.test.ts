import { describe, expect, it } from "vitest";
import {
  buildMapSlots,
  bucketForSlot,
  hoursUntil,
  relativeStart,
  formatStartTime,
} from "@/lib/map-slots";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const iso = (msFromNow: number) => new Date(NOW + msFromNow).toISOString();
const HOUR = 3_600_000;

describe("hoursUntil", () => {
  it("computes positive hours for future slots", () => {
    expect(hoursUntil(iso(2 * HOUR), NOW)).toBeCloseTo(2, 5);
  });

  it("is negative for past slots", () => {
    expect(hoursUntil(iso(-HOUR), NOW)).toBeCloseTo(-1, 5);
  });
});

describe("bucketForSlot", () => {
  it("buckets <=1h as now", () => {
    expect(bucketForSlot(iso(30 * 60_000), NOW)).toBe("now");
    expect(bucketForSlot(iso(HOUR), NOW)).toBe("now");
  });

  it("buckets >1h and <=6h as today", () => {
    expect(bucketForSlot(iso(3 * HOUR), NOW)).toBe("today");
    expect(bucketForSlot(iso(6 * HOUR), NOW)).toBe("today");
  });

  it("buckets >6h as week", () => {
    expect(bucketForSlot(iso(48 * HOUR), NOW)).toBe("week");
  });
});

describe("relativeStart", () => {
  it("says now for past or immediate slots", () => {
    expect(relativeStart(iso(-HOUR), NOW)).toBe("now");
  });

  it("formats minutes, hours and days", () => {
    expect(relativeStart(iso(30 * 60_000), NOW)).toBe("in 30 min");
    expect(relativeStart(iso(2 * HOUR), NOW)).toBe("in 2h");
    expect(relativeStart(iso(48 * HOUR), NOW)).toBe("in 2d");
  });
});

describe("formatStartTime", () => {
  it("returns placeholder for invalid input", () => {
    expect(formatStartTime("not-a-date")).toBe("--:--");
  });
});

describe("buildMapSlots", () => {
  const places = [
    { id: "p1", name: "Park", category: "running", lat: 52.2, lng: 21.0, district: "Śródmieście" },
    { id: "p2", name: "Bad", category: "not-a-category", lat: 52.3, lng: 21.1, district: null },
    { id: "p3", name: "NaN", category: "gym", lat: Number.NaN, lng: 21.1, district: null },
  ];
  const users = new Map([
    ["h1", { id: "h1", name: "Host", avatar_url: null }],
    ["a1", { id: "a1", name: "Ann", avatar_url: "x" }],
  ]);

  it("skips slots without a valid mappable place", () => {
    const slots = [
      { id: "s-noplace", place_id: null, host_id: "h1", title: "X", date_time: iso(HOUR) },
      { id: "s-badcat", place_id: "p2", host_id: "h1", title: "Y", date_time: iso(HOUR) },
      { id: "s-nan", place_id: "p3", host_id: "h1", title: "Z", date_time: iso(HOUR) },
    ];
    expect(buildMapSlots(places, slots, users, new Map())).toHaveLength(0);
  });

  it("dedupes participants and counts host once", () => {
    const slots = [
      { id: "s1", place_id: "p1", host_id: "h1", title: "Bieg", date_time: iso(HOUR) },
    ];
    const accepted = new Map([["s1", ["a1", "h1"]]]);
    const [slot] = buildMapSlots(places, slots, users, accepted);
    expect(slot.participantCount).toBe(2);
    expect(slot.participants.map((p) => p.name)).toEqual(["Host", "Ann"]);
  });

  it("sorts results by start time ascending", () => {
    const slots = [
      { id: "late", place_id: "p1", host_id: "h1", title: "B", date_time: iso(5 * HOUR) },
      { id: "early", place_id: "p1", host_id: "h1", title: "A", date_time: iso(HOUR) },
    ];
    const result = buildMapSlots(places, slots, users, new Map());
    expect(result.map((s) => s.id)).toEqual(["early", "late"]);
  });
});
