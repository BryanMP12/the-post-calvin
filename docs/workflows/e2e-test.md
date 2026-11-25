# E2E test

Playwright tests in `tests/e2e/`, run with `pnpm test:e2e` (see AGENTS.md "Commands" for how each run
gets a fresh local database seeded with `seed/seed.json`'s fixtures).

1. **Test what a reader or editor sees**, not implementation details. Use role- and label-based locators
   (`getByRole`, `getByLabel`); they double as accessibility checks.
2. **JavaScript is off by default**, because pages must work without it. Turn it on only for a test that
   needs it (axe, the Turnstile widget) with `test.use({ javaScriptEnabled: true })`.
3. **Data comes from the seed's fixture content.** If a test needs content that doesn't exist, add it to
   `seed/seed.json` (asks for permission) rather than creating it in the test, so every test reads the
   same known data. Never depend on dev data.
4. **New page type?** Add it to the list in `tests/e2e/accessibility.spec.ts`.
5. Cover the states: found, 404, empty, paginated, and for forms the error and success paths.
6. **Flaky test?** Find the cause (usually a missing wait on a navigation or response). Never add retries,
   sleeps or `test.skip` to make it pass. If a test is wrong, fix it and say why in the PR.
7. First run on a machine: `pnpm exec playwright install chromium`.
8. Run `pnpm test:e2e` and `scripts/agent/check-if-dirty.sh`; summarize.
