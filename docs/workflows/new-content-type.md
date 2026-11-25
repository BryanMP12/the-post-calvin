# New content type (propose, then wait)

For a new collection, field, taxonomy, byline field or menu. **Schema changes need the developer's
approval.** This workflow writes a proposal and stops; it changes nothing until approved.

## 1. Propose (no file changes)

Read docs/content-model.md, the `building-emdash-site` skill (schema-and-seed reference), and check the
EmDash docs MCP for the field types available in the installed version. Then write a proposal in the
conversation (or a PR description) with:

- **What and why:** the editorial need, in the editors' words.
- **Shape:** collection/field names, EmDash field types, required or optional, defaults, taxonomy links.
- **Editor-facing text:** a label and help text for every field (editors are not developers).
- **Effect on existing content:** new fields must be optional or defaulted. Never delete or retype a field.
- **Migration:** whether `tools/migrate` must populate it, and from which WordPress data.
- **Rendering:** which pages and components show it; any new `<Prose>` block it needs.

**Stop here** and wait for approval.

## 2. Implement (after approval)

1. Make the change on the **dev** instance (admin or `emdash-dev` MCP), never production.
2. Update `seed/seed.json` so an empty database gets the same schema (asks for permission: expected).
3. Restart `pnpm dev` so `emdash-env.d.ts` regenerates (or `pnpm exec emdash types`); commit it.
   Run `pnpm typegen` if bindings changed.
4. Record the change, with field help text, in docs/content-model.md, and update
   `docs/runbooks/editor-guide.md` if editors will use it.
5. Update `src/lib/content` wrappers, components and tests; update the migration mapping and fixtures if
   affected ([migration-test.md](migration-test.md)).
6. In the PR, list the exact steps the developer runs to apply the change to production.
7. Run `scripts/agent/check-if-dirty.sh` and `pnpm test:e2e`; summarize.
