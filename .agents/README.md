# .agents/

Tool-neutral agent resources. Instructions live in `/AGENTS.md`, not here.

- `skills/` — EmDash's agent skills (`building-emdash-site`, `creating-plugins`, `emdash-cli`), vendored
  unchanged from EmDash's blog template at the version in `emdash-skills-version`. Don't edit them by hand;
  re-sync with `scripts/agent/sync-emdash-skills.sh <version>` when the installed `emdash` version changes.

**AGENTS.md takes precedence over the skills.** In particular, the skills' examples use `npx emdash …` and
point the CLI at remote sites: in this repo run `pnpm exec emdash …`, and only against the local dev site.
