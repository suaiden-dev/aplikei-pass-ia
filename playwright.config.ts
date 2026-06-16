import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";
import fs from "node:fs";

const env = loadEnv("test", process.cwd(), "");

for (const [key, value] of Object.entries(env)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173";
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "1";
const chromiumExecutablePath = fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(chromiumExecutablePath
          ? {
              launchOptions: {
                executablePath: chromiumExecutablePath,
                args: ["--disable-crash-reporter", "--disable-crashpad"],
              },
            }
          : {}),
      },
    },
  ],
});
