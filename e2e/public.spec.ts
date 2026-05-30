import { expect, test } from "@playwright/test";

test.describe("Public pages", () => {
  test("landing shows hero", async ({ page }) => {
    await page.goto("/landing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /FIND YOUR PARTY|ZNAJDŹ SWOJE PARTY/i })).toBeVisible({
      timeout: 20_000,
    });
  });

  test("legal privacy loads", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page.getByRole("heading", { level: 1, name: /privacy policy/i })).toBeVisible();
  });

  test("legal terms loads", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page.getByRole("heading", { level: 1, name: /terms of use/i })).toBeVisible();
  });
});

test.describe("Route protection", () => {
  for (const path of ["/feed", "/notifications", "/settings"]) {
    test(`unauthenticated ${path} redirects to /auth`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/auth/, { timeout: 20_000 });
    });
  }
});

test.describe("SEO endpoints", () => {
  test("robots.txt is served with a sitemap reference", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/sitemap/i);
  });

  test("sitemap.xml is served as xml", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("<urlset");
  });
});
