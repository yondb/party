import { describe, expect, it } from "vitest";
import {
  detectLangFromGeoAndLocale,
  langFromSearchParams,
  parseLang,
  resolveRequestLang,
} from "@/lib/i18n-lang";
import { NextRequest } from "next/server";

describe("english-only lang", () => {
  it("always returns en", () => {
    expect(parseLang("pl")).toBe("en");
    expect(parseLang(null)).toBe("en");
    expect(detectLangFromGeoAndLocale("PL", "pl-PL")).toBe("en");
    expect(langFromSearchParams(new URLSearchParams("lang=pl"))).toBe(null);
  });

  it("resolveRequestLang is always en", () => {
    const req = new NextRequest("https://lfparty.com/map?lang=pl", {
      headers: { "x-vercel-ip-country": "PL" },
    });
    expect(resolveRequestLang(req).lang).toBe("en");
  });
});
