# Migration test

For changes to `tools/migrate/`. Read docs/migration.md and AGENTS.md "Migration" first.

**Never read `migration/`** (raw exports hold commenter personal data) and never commit anything from it.
Run `load` and `media` **only against the local dev site**; staging and production runs are the
developer's.

## Add a transform fixture

1. Find the post shape that needs handling (an unmapped element, a shortcode, a caption) from the
   `transform` report or a public post on the live site.
2. Save the post's HTML to `tools/migrate/tests/fixtures/<short-name>.html`, **anonymized**: replace
   commenter names and emails, and anything personal that isn't already public in the post.
3. Write the expected Portable Text next to it, or as an inline expectation in the test.
4. Add the test in `tools/migrate/tests/`. `transform` is pure: no network, no file system beyond the
   fixture.
5. Every HTML element the mapping doesn't handle must appear in the unmapped-elements report. Assert that.
6. The Portable Text must only use blocks `<Prose>` can render.

## Run the pipeline locally

1. Start the local site: `pnpm dev` (check with `pnpm exec astro dev status`).
2. `pnpm migrate extract` (rate-limited; reuses snapshots), then `pnpm migrate transform`.
3. `pnpm migrate load` and `pnpm migrate media` with the local dev site URL and a scoped local token.
4. `pnpm migrate verify`; read its report (counts, link and redirect checks).
5. Re-run `load`: nothing new should be created (idempotency). Report anything that duplicated.

Then run `scripts/agent/check-if-dirty.sh`; summarize, including the verify report's numbers.
