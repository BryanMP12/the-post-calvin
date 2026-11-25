# New page

For a new public route (an archive, a page type, a feed). Read AGENTS.md "URLs", "Astro rules" and
"SEO & feeds" first, and the `building-emdash-site` skill.

1. **Check the URL.** It must match the WordPress URL shape in AGENTS.md "URLs". A new URL structure, or a
   change to an existing one, needs the developer's approval: stop and ask.
2. **Data access.** Add or reuse a wrapper in `src/lib/content/` that calls EmDash's query functions and
   returns a discriminated union (e.g. found / not-found / redirect). Verify each EmDash function against
   the installed version (docs MCP `search_docs`). Unit-test the wrapper's logic in `tests/unit/`.
3. **Route file** in `src/pages/`: server-rendered (no `getStaticPaths()`, no prerender). Frontmatter stays
   thin: call the wrapper, map its result to 200 / 404 / redirect, pass `cacheHint` to
   `Astro.cache.set()` when `Astro.cache.enabled`. Branching or data shaping goes in a `.ts` module.
4. **Links** via `src/lib/url.ts`; pagination at `/…/page/{n}/`.
5. **Layout** through `BaseLayout` with title, description, canonical and Open Graph tags (`getSeoMeta`).
   Fixed UI text from `src/strings.ts`; editorial copy from EmDash. Styling uses design tokens only.
6. **No client JS** unless it's a small progressive enhancement; the page must work with JS off.
7. **Tests:** a Playwright spec in `tests/e2e/` (JS disabled) for the page and its 404/empty states, and add
   the page type to `tests/e2e/accessibility.spec.ts`. See [e2e-test.md](e2e-test.md).
8. **Docs:** update AGENTS.md "URLs" or docs/ if you added a route; update `docs/runbooks/editor-guide.md`
   if editors will see or control something new.
9. Run `scripts/agent/check-if-dirty.sh` and `pnpm test:e2e`; summarize.
