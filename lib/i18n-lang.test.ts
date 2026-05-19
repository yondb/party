import { describe, expect, it } from "vitest";
import {
  detectLangFromGeoAndLocale,
  langFromSearchParams,
  resolveRequestLang,
} from "@/lib/i18n-lang";
import { NextRequest } from "next/server";

describe("langFromSearchParams", () => {
  it("reads lang and hl", () => {
    expect(langFromSearchParams(new URLSearchParams("lang=pl"))).toBe("pl");
    expect(langFromSearchParams(new URLSearchParams("hl=en-GB"))).toBe("en");
    expect(langFromSearchParams(new URLSearchParams("hl=pl-PL"))).toBe("pl");
  });
});

describe("detectLangFromGeoAndLocale", () => {
  it("uses Poland geo", () => {
    expect(detectLangFromGeoAndLocale("PL", "en-US")).toBe("pl");
  });

  it("defaults to en outside PL", () => {
    expect(detectLangFromGeoAndLocale("DE", "en-US")).toBe("en");
    expect(detectLangFromGeoAndLocale(null, "en-US,en")).toBe("en");
  });

  it("uses Accept-Language pl without geo", () => {
    expect(detectLangFromGeoAndLocale(null, "pl-PL,pl;q=0.9,en;q=0.8")).toBe("pl");
  });
});

describe("resolveRequestLang", () => {
  it("prefers URL param over geo", () => {
    const req = new NextRequest("https://lfparty.com/map?lang=en", {
      headers: { "x-vercel-ip-country": "PL" },
    });
    const r = resolveRequestLang(req);
    expect(r.lang).toBe("en");
    expect(r.stripParams).toBe(true);
  });

  it("detects PL for Polish visitors without cookie", () => {
    const req = new NextRequest("https://lfparty.com/map", {
      headers: { "x-vercel-ip-country": "PL" },
    });
    expect(resolveRequestLang(req).lang).toBe("pl");
  });

  it("defaults to en abroad", () => {
    const req = new NextRequest("https://lfparty.com/map", {
      headers: { "x-vercel-ip-country": "US", "accept-language": "en-US" },
    });
    expect(resolveRequestLang(req).lang).toBe("en");
  });
});
