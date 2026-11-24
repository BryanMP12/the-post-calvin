# GitHub repository settings (developer)

One-time setup, done by the developer in the GitHub UI (or `gh`), not by agents.

## Branch protection on `main`

Settings → Rules → Rulesets → New branch ruleset, target the default branch (`main`):

- Require a pull request before merging (0 approvals is fine for a solo developer; agents still need a PR).
- Require status checks to pass: **pnpm check** (the `check` job in `.github/workflows/ci.yml`).
  Add the e2e job here once it exists.
- Require branches to be up to date before merging.
- Block force pushes; restrict deletions.

The status check only appears in the list after CI has run once on a PR, so open the first PR before
adding it.

## Checking it works

Open a PR whose `pnpm check` fails (e.g. an unformatted file): the merge button stays disabled.
A direct `git push origin main` is rejected.
