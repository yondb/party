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
