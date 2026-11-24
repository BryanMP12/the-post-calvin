import { defineConfig, devices } from "@playwright/test";

// The webServer (`pnpm build && pnpm preview` on port 4322 with a fresh local database) and
// global setup are added with the Astro + EmDash scaffold (see AGENTS.md "Commands").
export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] === undefined ? 0 : 2,
  reporter: process.env["CI"] === undefined ? "list" : [["github"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4322",
    // Pages must work without JavaScript; tests that need it (axe) opt in.
    javaScriptEnabled: false,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
