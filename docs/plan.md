# the post calvin — rebuild plan

Status: **draft for review** (2026-11-23). Owner: developer. Rules for humans and coding agents: see AGENTS.md.

## Goal

Replace the WordPress/Divi site at thepostcalvin.com with an Astro + EmDash site on Cloudflare that:

- has a new design built for long-form reading,
- supports many writers per site and per post (bylines), with author pages,
- keeps reader comments (moderated) and full-text search,
- carries over the entire archive (2013 → today): posts, authors, categories, tags, featured images,
  inline media and comments, **without breaking any existing URL or the RSS feed**,
- is easy for volunteer editors to run, and costs little to host.

## What we know about the current site (checked 2026-11-23)

- WordPress + Divi (Elegant Themes), Google Site Kit; a PHP deprecation notice shows on the page.
- Permalinks are `/{slug}/`; pagination `/page/{n}/`; author archives `/author/{slug}/`.
- The public REST API (`/wp-json/wp/v2/…`) is open. `content.rendered` is plain HTML (no Divi
  shortcodes) on recent posts; each post has one WP author, a category, several tags (tag ids run into
  the thousands, so there are many tags) and a featured image. Post ids are in the 26,000s (includes
  revisions/attachments; real post count to be measured in M5).
- Menu: About, Books (Essays 2016–2019, Essays 2013–2016, Donate), Resources, Archives.
  Subscribe-by-email goes to an external Mailchimp list. Footer: Calvin English dept. link, book retailers.
- Comments are on and low-volume; there is a search box.

To confirm in M0/M5: total posts/pages/comments/media, whether older posts contain Divi shortcodes or
`[caption]`/`[gallery]` shortcodes, co-authored posts (how they're marked today), custom fields,
category/tag/date/feed URLs in use (from Search Console / logs), and what "Archives" and "Resources" contain.

## Milestones

Each task is a small PR. ✅ done · 🟡 in progress · ⬜ not started.

### M0 — Foundation 🟡

- ✅ Repo setup: pnpm workspace (site + `tools/migrate`), Node 26, TS strict config, oxlint/oxfmt, Vitest,
  Playwright, `pnpm check`, CI, branch protection on `main`, pre-commit format hook.
  Until the scaffold, `pnpm check` runs `tsc` instead of `astro check` and tsconfig spells out the
  strictest flags; the scaffold PR switches both. CI runs `pnpm check` only; the e2e job comes with the scaffold.
- 🟡 Agent setup (tool-agnostic, see AGENTS.md "Agent workflow"): `scripts/agent/`, `docs/workflows/`,
  `.mcp.json`, EmDash skills in `.agents/skills/`, then the first tool adapter (`.claude/`) implementing
  the permission policy. Verify a fresh session of each agent you use picks up AGENTS.md.
- Scaffold Astro + EmDash (start from EmDash's blog template structure, not its styles), Cloudflare adapter,
  D1/R2 bindings. The template ships its own AGENTS.md: merge anything useful into ours, never replace it.
- `lint-banned-patterns` and `design-tokens` tests; CI running `pnpm check` + e2e.
- Staging Worker + domain (noindex), runbook. Editors get admin accounts on staging.
- **Spike (timeboxed, writes an ADR):** EmDash 1.5 comments, bylines and search APIs — exactly which
  functions/components exist, whether the comment form works without JS, how comment caching and
  notifications work, whether comments can be created with a historical date/status (needed for D2).

### M1 — Redesign ⬜ (can run in parallel with M0)

- Brief with editors: audience (alumni + current students + book readers), tone, what to keep (name,
  Calvin connection, the books), what's wrong today.
- Content inventory of page types: home, post, author, category/tag archive, archives index, search,
  page (About/Resources), books, 404.
- 2–3 visual directions (type pairing, color, layout of home + post) → editors pick one → full mockup of
  every page type at mobile and desktop, including comments, search results and empty states.
- Output in `docs/design/`: mockup, tokens (colors, type scale, spacing, radii), rationale.
  Reading quality is the priority: measure, line height, image treatment, pull quotes, dark mode (D6).

### M2 — Content model + core pages ⬜

- Schema in `seed/seed.json`: `posts` (title, slug, excerpt, featured image + alt, body, bylines,
  category, tags, published date, SEO; supports drafts, revisions, preview, scheduling, search, comments),
  `pages`, `books` (cover, description, retailer links — or pages with a custom block; decide in M2),
  taxonomies `category` and `tag`, byline schema (name, slug, bio, photo, class year?, website), menus.
  Recorded in `docs/content-model.md` with field help text.
- Fixture content in the seed: posts with 1 and 2+ bylines, long essays, images, comments.
- Pages: home (latest + featured), post, author, category, tag, archives index (by year), pages, books,
  404 — with pagination at the WordPress URL shapes (see AGENTS.md "URLs").
- `<Prose>` + custom blocks needed by migrated content (image with caption, pull quote, embed, divider).
- SEO: meta, canonical, OG, Article JSON-LD, sitemap, robots, `/feed/` RSS.
- e2e: every page type renders without JS; axe passes.

### M3 — Search ⬜

- `src/lib/content/search.ts` over EmDash FTS (title, excerpt, body, byline names if supported).
- `/search/?q=` page: GET form, paginated, highlighted excerpts, empty/no-result states, `noindex`.
- Search form in the header (no JS). Redirect WordPress `/?s=` → `/search/?q=`.
- Unit tests for query handling; e2e for search with the seed fixtures. Re-check relevance on real data after M6.

### M4 — Comments ⬜

- `<Comments>`: approved comments (threaded if EmDash supports replies), count on cards/posts, form.
- No-JS form + Turnstile; held for moderation; success/"awaiting moderation"/error states.
- Editor notification for pending comments (only if EmDash doesn't already provide it).
- Per-post "comments closed" if EmDash supports it (old posts may want comments off).
- Runbook: comment moderation for editors. e2e: submit → pending → approve in admin → visible.

### M5 — Migration tool ⬜ (start once the M2 schema is stable)

First task: expand this section into docs/migration.md (the full design + runbook). Summary:

1. **extract** — page through the public REST API (`posts`, `pages`, `users`, `categories`, `tags`,
   `media`, `comments`) with `context=view`, plus a WXR export (Tools → Export, from an editor) for drafts,
   private posts, author details and anything the REST API hides. Save raw JSON snapshots. Measure counts.
2. **transform** (pure, tested) —
   - HTML → Portable Text with our own mapping (paragraphs, headings, lists, blockquote, em/strong, links,
     images + captions, `<hr>`, embeds). Unknown elements are reported. Strip any leftover shortcodes
     (`[et_pb_*]`, `[caption]`, `[gallery]`) with explicit handling, never silently.
   - WP users → bylines (slug = WP author slug, display name, bio, avatar), one per post.
   - Categories/tags → terms (same slugs). Featured media → image field + alt.
   - Comments → EmDash comments per D2. Internal links `thepostcalvin.com/{slug}/` → relative links.
   - Redirect list: `/?p={id}`, attachment pages, date archives, `/wp-content/uploads/*` → new media URLs, renamed slugs.
3. **load** — upsert via the EmDash API with a scoped token, keyed by WP id (id map), in dependency
   order: terms → bylines → media → posts/pages → comments → redirects. Resumable.
4. **media** — download originals (not resized variants), upload to EmDash media/R2, rewrite references.
5. **verify** — counts per type match; sampled visual/text diff old vs new; every old post URL returns 200
   on the new site; every old redirect target resolves; no broken internal links or images; report.

- Develop against local dev with a sample (e.g. 50 posts across years), then a full run locally.

### M6 — Rehearsal on staging + editor onboarding ⬜

- Full migration run on staging (developer). Editors review: old vs new side by side for a sample per year.
- Fix mapping issues, re-run (idempotent). Measure total run time for the cutover window.
- Editor guide, onboarding, moderation runbook; editors try writing and publishing a post on staging.
- Performance (Lighthouse) and accessibility pass on real content.

### M7 — Launch ⬜

- Freeze WordPress (no new posts/comments; close comments) → final delta extract (modified since rehearsal)
  → run on production (developer) → verify → DNS/route switch → re-verify old URLs live.
- Search Console: submit new sitemap, watch 404s; check `/feed/` in a feed reader.
- Keep WordPress read-only (or a static export) for 30–90 days as a fallback, then archive the DB + uploads.

### Later (not in scope)

- Newsletter integration beyond the Mailchimp link · reader accounts · comment reply emails ·
  submissions form for new writers (would follow the Forms rules) · analytics choice (D7).

## Repo layout

One repo, a pnpm workspace with two packages:

```
/                     the site (Astro + EmDash Worker): src/, seed/, tests/, astro.config.ts, wrangler.jsonc
tools/migrate/        the migration tool: own package.json, tsconfig (extends root), src/, tests/
pnpm-workspace.yaml   packages: [".", "tools/migrate"]
```

The tool talks to the site only over EmDash's HTTP API, so it never imports site code and its
dependencies never reach the Worker bundle. It lives in the same repo so its Portable Text schema
can be checked against the blocks `<Prose>` renders in one PR. After launch it is archived (moved to a
tag/branch or deleted) once the fallback period ends.

## Decisions

- **D1 ✅ HTML → Portable Text:** `@portabletext/block-tools` + a server DOM (`linkedom`), in `tools/migrate` only.
- **D3 ✅ Comments** stay open on every post.
- **D4 ✅ Co-authorship:** none known in the archive; EmDash supports multiple bylines per post natively,
  so co-written posts work going forward. M5 still scans for posts naming two writers, just in case.
- **D5 ✅ Feed:** full text.
- **D6 ✅ Dark mode:** out of scope.
- **D7 ✅ Analytics:** Cloudflare Web Analytics (cookie-free). Remove Site Kit/GA at cutover.

## Open decisions

- **D2 Historical comments — direction agreed (2026-11-23):** keep original dates, names, threading and
  status. (a) Create them through an EmDash API or plugin that accepts date + status, if the M0 spike finds
  one; otherwise (c) store them as a read-only archived-comments field on each post and use EmDash comments
  only for new ones.
- **D8 Category/tag URLs — leaning toward cutting tag pages (2026-11-23).** Tags aren't shown on the
  current site, so they're likely low value. Decide after M5 extract (tag counts, posts per tag) and
  Search Console traffic for `/tag/*`. If cut: still import tags as data (cheap, reversible), don't build
  `/tag/` pages, and 301 `/tag/{slug}/` → `/search/?q={tag name}`. Category pages stay either way.
- **D9 Staging domain and editor roles** — deferred until M0 staging setup.
