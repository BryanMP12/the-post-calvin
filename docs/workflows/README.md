# Agent workflows

Step-by-step procedures any coding agent (or human) can follow. They apply AGENTS.md; if a workflow and
AGENTS.md disagree, AGENTS.md wins and the workflow gets fixed. Tool adapters (e.g. `.claude/commands/`)
only point here: change a workflow in this folder, never in an adapter.

| Workflow                                   | Use it to                                                      |
| ------------------------------------------ | -------------------------------------------------------------- |
| [new-page.md](new-page.md)                 | Add a public route                                             |
| [new-content-type.md](new-content-type.md) | Propose a collection, field or taxonomy (stops for approval)   |
| [e2e-test.md](e2e-test.md)                 | Add or fix a Playwright test                                   |
| [migration-test.md](migration-test.md)     | Add transform fixtures and run the migration against local dev |
| [review.md](review.md)                     | Check a diff against AGENTS.md (read-only)                     |
| [release.md](release.md)                   | Get a branch PR-ready (never push or deploy)                   |

Every workflow ends the same way: `scripts/agent/check-if-dirty.sh` passes, then a summary of what changed
and what you were unsure about (AGENTS.md "Definition of done").
