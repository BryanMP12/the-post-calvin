# GitHub repository settings (developer)

One-time setup, done by the developer in the GitHub UI (or `gh`), not by agents.

## Branch protection on `main`

Settings → Rules → Rulesets → New branch ruleset, target the default branch (`main`):

- Require a pull request before merging (0 approvals is fine for a solo developer; agents still need a PR).
- Tick **Require status checks to pass**, then **+ Add checks**, search for **pnpm check** and pick
  the GitHub Actions result. That is the job's display name (`name:` of the `check` job in
  `.github/workflows/ci.yml`), not the workflow name "CI". Add the e2e job here once it exists.
- In the same section, tick **Require branches to be up to date before merging**.
- Block force pushes; restrict deletions.

The search only suggests checks that ran on the repo in the last 7 days (any run counts: a push to
`main` or a PR). If it isn't listed, push a commit to make CI run, or type the exact name.

## Checking it works

Open a PR whose `pnpm check` fails (e.g. an unformatted file): the merge button stays disabled.
A direct `git push origin main` is rejected.

Set up 2026-11-24.
