import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const localBaseURL = `http://127.0.0.1:${PORT}`;
const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL?.trim();
const baseURL = remoteBaseURL || localBaseURL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: remoteBaseURL
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
