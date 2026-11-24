# the post calvin — thepostcalvin.com

A personal-essay blog by Calvin University alumni writers (est. 2013), with hundreds of authors, a
long archive, reader comments and two published essay collections ("Books").
This is a ground-up rebuild **and redesign** of a WordPress (Divi theme) site. Do not port WordPress
themes, plugins or PHP; port *content and behavior* only (posts, authors, comments, URLs, feeds).

**People:** the editors (alumni volunteers) write, edit, publish and moderate comments in the EmDash
admin. Most writers never log in: they are **bylines**, not users. The developer (repo owner)
maintains code and the content model. Build for non-technical editors.

## Stack (change only via an ADR in docs/adr/)
- **Framework:** Astro (server-rendered pages, zero client JS by default)
- **CMS:** EmDash, running *inside* this Astro app — admin at `/_emdash/admin`, API at `/_emdash/api`
- **Hosting:** Cloudflare Workers via the Astro Cloudflare adapter; D1 (content + comments), R2 (media)
- **Email:** Cloudflare Email Service (`send_email` binding), editor notifications only
- **Styling:** Tailwind CSS v4 (+ `@tailwindcss/typography` for post bodies)
- **Validation:** Zod, as re-exported by Astro (the same Zod that Astro Actions use): `import { z } from "astro/zod"`.
  Don't install a separate copy.
- **Language:** TypeScript 6.0.x, strict mode. Move to TypeScript 7 as soon as `@astrojs/check` supports it
  (check its `typescript` peer range; 0.9.12 allows only ^5 || ^6). It needs TypeScript's JS API, which 7.0,
  the native Go port, doesn't have yet.
- **Lint / format:** oxlint (`.oxlintrc.json`, type-aware via `oxlint-tsgolint`) and oxfmt (`.oxfmtrc.json`,
  `.astro` formatting via `@astrojs/compiler-rs`). No ESLint or Prettier.
- **Package manager:** pnpm (version pinned in `packageManager`). Never use npm, yarn or `npx`;
  use `pnpm exec <bin>`. Node version is in `.nvmrc` (26).
- **No UI framework in our pages** (no React/Solid/Vue components or `client:*` islands). Adding one requires an ADR.
  Note: EmDash's admin UI is built with React, so `@astrojs/react`/`react` are installed as EmDash dependencies.
  That's expected. Leave them alone, but never use them in `src/`.
- **Single language (English).** No i18n routing, locale folders or string catalogs. Don't add Astro's
  `i18n` config; adding a language later needs an ADR.

**Work with the framework, not against it.** Prefer EmDash's and Astro's documented APIs over
custom solutions. If a requirement seems to need a workaround, stop and raise it instead of hacking.

## Repo map
```
astro.config.ts     Astro + EmDash config
src/pages/          File-based routes (see "URLs")
src/layouts/        Page shells (BaseLayout handles <head>, SEO, canonical, feed links)
src/components/     .astro components (PostCard, Byline, Comments, SearchForm, Pagination, Prose, Image…)
src/actions/        Astro Actions (form handlers, server-only)
src/lib/content/    The ONLY place that queries EmDash. Thin typed wrappers over EmDash's API.
src/lib/email/      Email sending (EmailSender interface + Cloudflare implementation)
src/lib/forms/      Form state, validation messages, Turnstile check
src/strings.ts      The few fixed UI strings (labels, errors), typed
src/styles/global.css  Tailwind entry + @theme design tokens
seed/seed.json      Initial EmDash schema + fixture content (only applied to an empty DB)
tools/migrate/      WordPress → EmDash migration tool: a separate pnpm workspace package (own package.json,
                    deps, tsconfig, tests). Node only, never imported by src/, never bundled. See docs/migration.md.
pnpm-workspace.yaml Workspace = the site (repo root) + tools/migrate
tests/              Vitest unit tests (tests/unit) + Playwright e2e (tests/e2e)
docs/               Plan, ADRs, content model, migration, runbooks, design. Read docs/plan.md before a new milestone.
scripts/agent/      Shared agent scripts (format a file, check before done); see "Agent workflow"
scripts/git-hooks/  Pre-commit formatting (installed by pnpm install)
.agents/skills/     EmDash agent skills
.claude/ (etc.)     Per-tool adapters only: settings/hooks/commands that implement "Agent workflow"
```

## Commands
- `pnpm dev`        — local dev (Astro + EmDash, local D1/R2; email is simulated and logged)
- `pnpm check`      — `astro check` + oxlint (type-aware) + `oxfmt --check` + unit tests. **Must pass before you say you're done.**
- `pnpm lint` / `pnpm format` / `pnpm test` — the individual pieces (`pnpm format` writes)
- `pnpm test:e2e`   — Playwright against `pnpm build && pnpm preview` on port 4322 (JavaScript disabled by default).
  Each run starts from an empty local database in `.wrangler/e2e-state` (never the dev data), and
  `tests/e2e/global-setup.ts` runs EmDash's setup step with "include sample content" (repeating the call
  until the chunked seed reports `seedComplete`), so the seed's fixture posts, bylines and comments are
  what e2e tests read. The build's copy of `.dev.vars` (`dist/server/.dev.vars`) is deleted before preview,
  so personal dev vars never change e2e results. First run: `pnpm exec playwright install chromium`.
- `pnpm typegen`    — `wrangler types` + `astro sync` (run after changing bindings or EmDash schema)
- `pnpm build`      — build with the local (top-level) wrangler config, as e2e uses it
- `pnpm migrate <step>` — the migration tool (alias for `pnpm --filter migrate run cli <step>`) (`extract`, `transform`, `load`, `media`, `verify`; see
  docs/migration.md). Agents may run `extract`/`transform` and `load`/`media` **against the local dev site only**.
- `pnpm deploy`     — `CLOUDFLARE_ENV=production` build + `wrangler deploy` (uses `env.production` in
  `wrangler.jsonc`, which sets `EMDASH_SITE_URL`). Humans only; see docs/runbooks/launch.md.
- `pnpm deploy:staging` — the same with `CLOUDFLARE_ENV=staging` (`env.staging`): the unlisted preview
  for the editors (domain in docs/runbooks/staging.md). Humans only.
- Astro 7 detects AI agents and starts `astro dev` / `astro preview` **in the background**. Check with
  `pnpm exec astro dev status`, read logs with `pnpm exec astro dev logs`, stop with `pnpm exec astro dev stop`
  (same for `preview`). `--ignore-lock` forces the foreground (the Playwright config uses it).

## Definition of done (every task)
1. `pnpm check` passes with zero new warnings.
2. New behavior has a test (unit for logic, Playwright for user-visible flows).
3. No hardcoded editorial copy in components: content comes from EmDash; fixed UI text from `src/strings.ts`.
4. Changed pages work with JavaScript disabled and have title, description, canonical and Open Graph tags.
5. Docs updated if you changed architecture, env vars, bindings, routes, content schema or the migration.
6. End with a summary of what changed and anything you were unsure about.

## TypeScript rules
The type checker is the main safety net for autonomous work. Don't weaken it to make errors go away.

**Config** (tsconfig extends `astro/tsconfigs/strictest`, plus): `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`,
`noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `erasableSyntaxOnly`. Never loosen tsconfig without an ADR.
(Most come from the preset; tsconfig.json adds only `noPropertyAccessFromIndexSignature` and `erasableSyntaxOnly`.)
Under `exactOptionalPropertyTypes`, don't pass a possibly-`undefined` value to an optional property: spread it
conditionally (`...(x === undefined ? {} : { x })`) or use the library's `null` form.
`tests/unit/lint-banned-patterns.test.ts` proves the lint rules and tsconfig flags below still fire; keep it passing.
The same rules apply to `tools/migrate/` (its tsconfig extends the root one).

**Banned** (enforced by oxlint's typescript-eslint rules, which mirror `strictTypeChecked` + `stylisticTypeChecked`;
`enum` and runtime `namespace` are also compile errors via `erasableSyntaxOnly`):
- `any` (explicit or implicit). Use `unknown` and narrow it.
- Non-null assertions `x!`. Handle the `undefined` case or restructure so it can't happen.
- Type assertions `x as T` and `<T>x`. Allowed: `as const`. Prefer `satisfies` to check a value against a type.
- `@ts-ignore` and `@ts-nocheck`. `@ts-expect-error` only with a comment explaining why and a linked issue.
- `enum` and `namespace`. Use union literals or `as const` objects.
- Double casts (`as unknown as T`). Never.

**Do instead:**
- **Parse at the boundaries.** Anything from outside the type system (EmDash responses if not already
  typed, WordPress REST/WXR data, `FormData`, env vars, `JSON.parse`, `fetch`, URL params, headers) is
  validated with Zod or narrowed with a type guard, never cast. Inside the boundary, trust the types.
- Model states with discriminated unions; end `switch`es with an exhaustive check (`const _: never = x`).
- Explicit return types on exported functions. Type-only imports with `import type`.
- `readonly` props and arrays by default; mutate only local state.
- Use `?.` and `??` deliberately. Don't use `||` for defaults when `0`/`""` are valid values.
- Indexed access (`arr[0]`, `record[key]`) returns `T | undefined`. Handle it; don't assert it away.

**Escape hatch:** if a cast is truly unavoidable (e.g. a library's types are wrong), isolate it in one
small, tested function with `// oxlint-disable-next-line <rule> -- <reason>`, and list it in the PR summary.
A new escape hatch needs human approval.

## Astro rules
- **Zero client JS by default.** A `<script>` tag is allowed only for small progressive
  enhancements (nav toggle, inline form feedback). Pages must work without it.
- Public pages are CMS-driven, so they render on demand (`output: "server"`). Don't prerender them or use
  `getStaticPaths()` for CMS content: editors' changes would not appear until a redeploy, and the build
  can't see production D1.
- Caching follows EmDash: pass every query's `cacheHint` to `Astro.cache.set(cacheHint)` when
  `Astro.cache.enabled`, and use the `*WithCacheHint` variants for settings, menus, taxonomies and widget areas.
  Comment lists must reflect moderation promptly: follow EmDash's guidance for comment cache invalidation.
- Data is fetched in component frontmatter via `src/lib/content` — never in client scripts.
- **Keep `.astro` frontmatter thin:** calls into `src/lib/` and simple prop wiring only.
  oxlint's type-aware rules (exhaustive `switch`, `??` vs `||`, floating promises, `no-unsafe-*`) don't
  run in `.astro` files, so any branching, parsing or data shaping goes in a `.ts` module (with a unit test).
  `astro check` still type-checks `.astro` files.
- Bindings/secrets are read server-side only, via `import { env } from "cloudflare:workers"` (Astro 7's
  Cloudflare adapter has no `Astro.locals.runtime.env`). Never expose them to the client or log them.
- `Astro.cache` is always defined in Astro 7 (check `Astro.cache.enabled`, not `Astro.cache?.enabled`).
- Workers runtime: no `fs`, no long-running processes. If a library needs Node-only APIs, stop and say so.
  (`tools/migrate/` runs in Node and is never imported by `src/`.)

## URLs (preserve the WordPress ones)
Existing links from social media, Calvin pages and search engines must keep working.
- Posts: `/{slug}/` (WordPress "post name" permalinks, trailing slash). Pages share the same namespace,
  so a post slug and a page slug must never collide (validated in `src/lib/content`, checked by the migration).
- Authors: `/author/{slug}/`. Categories: `/category/{slug}/`. Tags: `/tag/{slug}/`.
- Pagination: `/page/{n}/`, and `/{archive}/page/{n}/` on author/category/tag archives.
- Feed: `/feed/` (and per-author/category feeds if the old site had them). Readers are subscribed to it: never move it.
- Search: `/search/?q=…` (also redirect WordPress's `/?s=…`).
- Anything else WordPress served (`/?p={id}`, date archives, `/wp-content/uploads/…`, attachment pages) is
  301-redirected via EmDash redirects, generated by the migration tool. Changing URL structure needs approval.
- `trailingSlash` is set once in `astro.config.ts`; build links with `src/lib/url.ts`, never by hand.

## Multi-author (bylines)
- Writers are **EmDash bylines** (guest bylines without accounts are normal). Users are only for editors.
- A post can have several bylines (EmDash supports this natively; the archive has none known today,
  so migrated posts get one each). Render them in order with `<Byline>`.
  Entries have `data.byline` / `data.bylines` loaded eagerly: don't re-query per post.
- Author pages list that byline's published posts, newest first, paginated, with bio and photo from the byline.
- Byline slugs match the old `/author/{slug}/` slugs.

## Comments
- Use **EmDash's built-in comments** (storage in D1, moderation queue and admin screens, comment hooks).
  Don't build a parallel comment system or add a third-party widget.
- New comments are **held for moderation** by default; editors approve in the admin.
- Comments stay open on every post, old or new (decided 2026-11-23). No auto-close.
- Rendering and submitting go through `src/lib/content/comments.ts` and `<Comments>`. The comment form is a
  plain `<form method="POST">` that works without JavaScript, protected by Turnstile (see "Forms").
  Use EmDash's documented comment API/components; if they require client JS or don't fit, stop and raise it.
- Comments are personal data (name, email, IP if EmDash stores it). Never render emails, never log comment
  bodies or emails, never echo raw input unescaped. Replies/threads follow EmDash's model.
- Imported WordPress comments keep their original author name, date, threading and approval status (see
  docs/migration.md). If EmDash can't accept historical comments, they become a read-only archive on each
  post instead (decision D2 in docs/plan.md).

## Search
- Use **EmDash's full-text search** (`search` from `"emdash"`, FTS5 on D1) on the posts collection, with the
  fields marked searchable in the schema. No external search service without an ADR.
- `/search/` is server-rendered from a GET form (`?q=`), works without JS, is paginated, `noindex`,
  and shows title, bylines, date and a highlighted excerpt. Empty and no-result states are designed.
- Search query handling (trimming, length limit, paging) lives in `src/lib/content/search.ts` with tests.

## Forms
- Every form is a plain HTML `<form method="POST">` bound to an Astro Action in `src/actions/`
  (unless EmDash's own comment endpoint is the documented way; see "Comments").
- Use `defineAction({ accept: "form", input: z.object(...) })`. Read results with
  `Astro.getActionResult()` and show field errors via `isInputError()`, all rendered on the server.
- Validation messages come from `src/strings.ts`, not Zod's defaults. Forms use `novalidate` so all
  messages come from the server in one consistent voice. Logic lives in `src/lib/forms/` (tested).
- Protect public forms with Cloudflare Turnstile, verified server-side (`src/lib/forms/turnstile.ts`).
  It's the one exception to "pages work without JavaScript": the widget needs JS, so forms show a
  `<noscript>` note. Keys: `TURNSTILE_SITE_KEY` (var) and `TURNSTILE_SECRET_KEY` (secret). Neither set =
  off (local dev, e2e); only one set = every submission refused (fail closed).
- Never trust hidden fields; never echo raw input back unescaped.
- Shared pieces: `src/lib/forms/state.ts`, `checkTurnstile`, and the `TurnstileWidget`, `FormField`,
  `FormAlert` and `SubmitButton` components.

## Email
- All sending goes through `src/lib/email` (`EmailSender` interface). Never call the binding directly elsewhere.
- **Scope: editor notifications only** (e.g. "a comment is waiting for moderation"), sent to one editors'
  address (`EDITORS_NOTIFY_EMAIL`, sender `EDITORS_EMAIL_FROM`) through the `EDITORS_EMAIL` binding,
  restricted with `allowed_destination_addresses`. Check first whether EmDash already notifies on new
  comments; don't duplicate it. Local dev and e2e simulate sending.
- EmDash's own sign-in emails use its `cloudflareEmail()` plugin on a separate `EMAIL` binding. Never send site mail through it.
- **No email to readers or commenters** (no reply notifications, no newsletter). The newsletter stays on the
  external Mailchimp list, linked from a CMS-editable menu/setting. Changing that needs approval.

## Content & CMS rules
- **CMS owns content; code owns layout.** If editors might want to change it, it goes in EmDash.
- Use EmDash's query functions via thin wrappers in `src/lib/content`. Don't call the REST API from pages.
  The wrapper returns a discriminated union; the route file maps it to a response (200 / 404 / redirect).
  Verified in emdash 1.5: `getEmDashEntry(type, slug)`, `getEmDashCollection(type, { … })`,
  `getMenu(name)` / `getMenuWithCacheHint`, `getSiteSettings` / `getSiteSettingsWithCacheHint`,
  `getTaxonomyTerms`, `getTerm`, `getEntryTerms`, `getEntriesByTerm`, `getByline`, `getBylineBySlug`,
  `search`, `getSeoMeta`, `decodeSlug`. Re-verify against the installed version before relying on others.
- **Prefer EmDash's recommended approach** (docs MCP `search_docs`, `.agents/skills/`, especially
  `building-emdash-site`). If the docs have no good recommendation, stop and raise it rather than inventing one.
- Entry ids: `entry.id` is the slug (use it in URLs); `entry.data.id` is the database ULID (use it for API
  calls such as comments and `getEntryTerms`).
- Image fields are objects (`{ src, alt, … }`), not strings. Featured images require alt text.
- Taxonomy names in queries must match the seed's `"name"` exactly (`"category"`, `"tag"`).
- `emdash-env.d.ts` is generated by EmDash when the dev server starts. Don't edit it; commit the regenerated
  file with any schema change. `pnpm exec emdash types` regenerates from a running site.
- `src/live.config.ts` is EmDash boilerplate. Don't modify it.
- **All photos are CMS-managed** (EmDash media on R2): featured images, byline photos, book covers.
  Only the logo, icons and decorative shapes live in the repo.
- Navigation and footer links come from EmDash menus so editors can edit them (About, Books, Resources,
  Archives, Subscribe, Donate, retailer links).
- Rich text is Portable Text. Render it only via the shared `<Prose>` component (EmDash's renderer
  wrapped in Tailwind `prose` classes). Custom blocks (pull quote, image with caption, embed) get their own
  components, registered there. Migrated content must only use blocks `<Prose>` can render.
- Every collection/field needs a clear label and help text — editors are not developers. (The seed
  format supports a `description` on collections but no help text on fields; record field help text in
  docs/content-model.md until EmDash supports it.)
- Schema changes: made on the **dev** instance, recorded in docs/content-model.md, then applied to
  production by the developer. `seed/seed.json` only seeds an empty database.
- **Never** delete/retype a field, bulk-delete content, or write to the production CMS. Production
  content belongs to the editors. Agents use the dev instance only (including the EmDash MCP server).

## Migration (WordPress → EmDash)
- Our own tool in `tools/migrate/`, **not** EmDash's WordPress import wizard or Exporter plugin.
- Its dependencies (`@portabletext/block-tools`, a server DOM such as `linkedom`, WXR parsing) live only in
  `tools/migrate/package.json`. Never add them to the site's package.json. HTML → Portable Text uses
  block-tools with a schema that matches the blocks `<Prose>` renders (decided 2026-11-23).
  Design and status: docs/migration.md.
- Pipeline: `extract` (WordPress REST API + WXR export → raw JSON snapshots in `migration/raw/`, gitignored)
  → `transform` (pure, unit-tested: HTML → Portable Text, WP users → bylines, terms, comments, redirects)
  → `load` (EmDash API with a scoped API token) → `media` (download originals, upload to EmDash media,
  rewrite references) → `verify` (counts, sampled content diffs, link and redirect checks).
- **Idempotent and resumable:** every write is an upsert keyed by the WordPress id, recorded in an id map;
  re-running never duplicates. Rate-limit requests to the old site.
- `transform` is pure and fixture-tested with real (anonymized) post HTML in `tools/migrate/tests/fixtures/`.
  Every HTML element we don't map is reported, never silently dropped.
- Never commit raw exports, the id map, tokens, or commenter emails. `migration/` is gitignored.
- Agents run `load`/`media` only against the local dev site. Staging and production runs are humans only.

## Styling (Tailwind v4)
- This is a redesign: the approved design lives in `docs/design/` (reference mockup + tokens). Copy its
  values, never its markup or scripts. Nothing is carried over from the Divi theme.
- Design tokens (colors, fonts, type scale, spacing, radii, shadows) live in the `@theme` block in
  `src/styles/global.css`. Tailwind's default palette, fonts, sizes, radii and shadows are cleared, so only
  our tokens exist. **No arbitrary values** (`bg-[#3a7bd5]`) without a comment explaining why.
  A new token needs a design reason; text colors must pass `tests/unit/design-tokens.test.ts`.
- Reading comes first: post bodies use a comfortable measure (~65–75ch), generous line height, and the
  typography plugin tuned to the tokens. Test long essays, not just lorem ipsum.
- Tailwind scans only `src/` (`source("..")`). The stylesheet is imported once, in BaseLayout.
- Focus rings come from the base `:focus-visible` style (`--focus-ring`). Set it per surface for contrast.
- When a class combination repeats, make an `.astro` component. Avoid copy-pasted class strings and `@apply`.
- Fonts via Astro's Fonts API (`fonts` in astro.config.ts, `<Font>` in BaseLayout). Don't hardcode font families in components.
- Accessibility: WCAG 2.2 AA. Semantic HTML first, labelled inputs, visible focus, contrast ≥ 4.5:1.
  `tests/e2e/accessibility.spec.ts` runs axe on every page type (with JavaScript on, since axe is a script);
  add new page types to its list.
- Images go through the shared `<Image>` component (alt text required, responsive sizes, lazy by default).

## SEO & feeds
- Every page: title, description, canonical, Open Graph/Twitter tags (featured image), via BaseLayout + `getSeoMeta`.
- Posts emit `Article` JSON-LD with every byline as an author.
- Sitemap from EmDash; `robots.txt` allows indexing only in production (staging is `noindex`).
- RSS at `/feed/` with **full post content** (decided 2026-11-23), bylines and featured image.

## Analytics
- Cloudflare Web Analytics only (cookie-free, no personal data, so no consent banner; decided 2026-11-23).
  Its beacon is the one allowed third-party script: loaded `defer` from BaseLayout, production only
  (token from an env var), and nothing depends on it. No Google Analytics/Site Kit, no other trackers.

## Guardrails for autonomous work
- Work on a branch; never push to `main`. Open a PR with a summary and test evidence.
- **Ask before:** adding a dependency, changing `wrangler.jsonc` bindings, deploying, touching DNS,
  changing URL structure, changing the content schema, running the migration anywhere but local dev,
  or deleting anything.
- Don't fix failing tests by weakening or skipping them. If a test is wrong, explain why in the PR.
- Don't silence type or lint errors with casts, disables, or config changes. Fix the cause.
- After two genuine failed attempts, stop and write up what you tried.
- Keep PRs small and scoped to one task from docs/plan.md.

## Agent workflow (tool-agnostic)
This file is the single source of instructions for every coding agent (and a useful read for humans).
Keep it tool-neutral: no instructions that only one agent understands. Tool-specific setup lives in thin
adapter folders that point back here and to the shared pieces below.
- **Enforced for everyone by the repo, not by any agent:** `main` is branch-protected (PR + passing CI);
  CI runs `pnpm check` and `pnpm test:e2e`; a git pre-commit hook (`scripts/git-hooks/`, installed by
  `pnpm install`) runs oxfmt on staged files. Deploy credentials, Cloudflare secrets and production tokens
  are never available on developer or agent machines except the developer's own deploy step.
- **Permission policy** (every agent's config must implement it): allowed: routine `pnpm`/`git` commands.
  Ask first: `pnpm add`, `git push`, edits to `wrangler.jsonc`, `seed/seed.json`, `tsconfig.json`,
  `.oxlintrc.json`. Never: deploys, `wrangler secret`, remote D1/R2, pushing to `main`, `rm -rf`,
  npm/npx/yarn, reading `.env`/`.dev.vars`, reading `migration/` (it holds commenter personal data).
- **Shared scripts** (`scripts/agent/`): `format-file.sh <path>` (run after editing a file) and
  `check-if-dirty.sh` (runs `pnpm check` when the working tree has changes; run before saying you're done).
  Agents that support hooks wire these up; others run them by hand.
- **Workflows** (`docs/workflows/`, plain Markdown any agent can follow): `new-page.md`,
  `new-content-type.md` (propose, then wait for approval), `release.md` (get a branch PR-ready; never push
  or deploy), `review.md` (read-only diff check against this file), `e2e-test.md`, `migration-test.md`
  (add transform fixtures, run the pipeline against local dev only). Tool adapters may expose these as
  commands/agents, but the Markdown is the source of truth: change it there, not in an adapter.
- **MCP servers:** `emdash-docs`, `cloudflare-docs`, and `emdash-dev` (the local dev site's MCP at
  `localhost:4321`, OAuth on first use; needs `pnpm dev` running). The list lives in `.mcp.json`; agents
  that use another config format mirror it. Never connect an agent to production.
- **Skills:** EmDash's agent skills live in `.agents/skills/` (e.g. `building-emdash-site`). Read the
  relevant `SKILL.md` before EmDash work if your agent doesn't load them automatically.
- **Adapters:** `.claude/` (Claude Code: settings, hooks and commands that implement the above) is the
  first one. Add others (e.g. `.codex/`, `.cursor/`) the same way. Personal overrides go in each tool's
  gitignored local settings file. If a tool reads a different instructions file name, symlink or
  import this file; never fork its content.

## Where to look
- docs/plan.md — milestones, status, open decisions
- docs/adr/ — architecture decisions (read before proposing changes)
- docs/content-model.md — collections, fields, taxonomies, bylines, editor roles
- docs/migration.md — the WordPress migration: sources, mapping, runbook, verification, known gaps
- docs/design/ — approved redesign (mockup, tokens, rationale)
- docs/workflows/ — step-by-step agent workflows (new page, content type, release, review, tests)
- docs/runbooks/ — launch/cutover, staging, onboarding an editor, comment moderation, and `editor-guide.md`
  (the plain-language guide for editors: update it when the admin, a collection or a fixed slug changes)
