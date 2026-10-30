import { defineConfig } from "vitest/config";

// Unit tests only. The browser flows are Playwright tests in e2e/ (pnpm test:e2e).
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    environment: "node",
  },
});
