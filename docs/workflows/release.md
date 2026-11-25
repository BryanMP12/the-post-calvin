# Release (get a branch PR-ready)

Prepares the current branch for a pull request. **Never push, merge or deploy**: those are the
developer's.

1. You're on a branch, not `main`, and the branch holds one task from docs/plan.md.
2. `git status` is clean or every change is intended; no stray files, no `migration/` content, no secrets.
3. `pnpm check` passes with zero warnings.
4. `pnpm test:e2e` passes (once the site exists).
5. Run the [review](review.md) workflow on the branch and fix what it finds.
6. Docs: docs/plan.md status for the task; AGENTS.md, docs/ and runbooks updated if architecture, env vars,
   bindings, routes, schema or the migration changed.
7. Commits are focused, with messages that say why.
8. Write the PR description: what changed, how it was tested (commands and results), any escape hatches
   (listed individually), anything you were unsure about, and anything the developer must do by hand
   (secrets, production schema steps, settings).
9. Stop and hand over: give the developer the branch name and the PR description.
