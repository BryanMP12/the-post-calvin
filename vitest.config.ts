import { defineConfig } from "vitest/config";

// One `pnpm test` runs the site's unit tests and the migration tool's tests.
export default defineConfig({
  test: {
    projects: [{ test: { name: "site", include: ["tests/unit/**/*.test.ts"] } }, "tools/migrate"],
  },
});
