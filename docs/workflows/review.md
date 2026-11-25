# Review (read-only)

Checks a diff against AGENTS.md. **Change nothing**: report findings, most serious first, each with a
`file:line` and what to do instead. Default diff: the current branch against `main`
(`git diff main...HEAD` plus uncommitted changes).

Check, in order:

1. **Scope:** one task from docs/plan.md; nothing unrelated.
2. **Guardrails:** no new dependency, binding, schema, URL or deletion without recorded approval; no
   writes to production; nothing from `migration/`, `.env` or `.dev.vars`; no secrets or emails logged or
   rendered.
3. **TypeScript:** no `any`, `x!`, `as T` (except `as const`), `@ts-ignore`, `enum`, `namespace`, or lint
   disables without an approved escape hatch; boundary data parsed with Zod; exhaustive switches.
4. **Astro:** server-rendered CMS pages, thin frontmatter, `cacheHint` passed on, bindings via
   `cloudflare:workers`, no client JS beyond a progressive enhancement.
5. **Content:** EmDash queried only from `src/lib/content`; no hardcoded editorial copy; fixed UI text in
   `src/strings.ts`; links built with `src/lib/url.ts`; images through `<Image>` with alt text.
6. **Forms and comments:** plain POST forms bound to Actions, `novalidate`, messages from `src/strings.ts`,
   Turnstile verified server-side, nothing echoed unescaped.
7. **Styling:** tokens only (arbitrary values have a comment), no repeated class strings, WCAG 2.2 AA.
8. **Tests:** new behavior has a test; no test weakened, skipped or retried into passing.
9. **Docs:** architecture, env vars, bindings, routes, schema or migration changes are documented.

End with a verdict: ready, ready with nits, or needs changes.
