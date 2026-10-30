import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

// Locally: builds the shop and starts it on PORT (default 3100, clear of common dev ports) with a
// test hook secret. Against a deployment: BASE_URL=https://… with that deployment's
// INTENZO_HOOK_SECRET and, for a protected Vercel preview, VERCEL_AUTOMATION_BYPASS_SECRET.
// Both can live in .env.local (gitignored).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const port = Number(process.env.PORT ?? 3100);
const remote = process.env.BASE_URL;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (remote && !process.env.INTENZO_HOOK_SECRET) {
  throw new Error("BASE_URL is set, so INTENZO_HOOK_SECRET must be too (the deployment's value)");
}
process.env.INTENZO_HOOK_SECRET ??= "local-e2e-secret";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: remote ?? `http://localhost:${port}`,
    // Vercel's documented bypass for automation; the demo shop loads nothing third-party.
    ...(bypass && {
      extraHTTPHeaders: {
        "x-vercel-protection-bypass": bypass,
        "x-vercel-set-bypass-cookie": "true",
      },
    }),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: remote
    ? undefined
    : {
        command: `pnpm build && pnpm start --port ${port}`,
        url: `http://localhost:${port}/products`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: { INTENZO_HOOK_SECRET: process.env.INTENZO_HOOK_SECRET },
      },
});
