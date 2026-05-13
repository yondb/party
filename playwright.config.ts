import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = 3001;
const baseURL = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? baseURL,
    trace: "on-first-retry",
    navigationTimeout: 60_000,
  },
  timeout: 60_000,
  webServer: {
    command: `npx next dev -p ${E2E_PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
