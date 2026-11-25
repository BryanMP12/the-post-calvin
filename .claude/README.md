# .claude/ — Claude Code adapter

Wiring only: no instructions live here. Claude Code reads `/AGENTS.md` directly.

- `settings.json` — implements AGENTS.md's permission policy (allow / ask / deny), enables the MCP
  servers from `/.mcp.json`, and wires the hooks.
- `hooks/` — call the shared `scripts/agent/` scripts: format each edited file; run `check-if-dirty.sh`
  before finishing a turn (blocks once if `pnpm check` fails).
- `commands/` — `/new-page`, `/review`, … each one line pointing to `docs/workflows/`.
- `skills` — symlink to `/.agents/skills` so Claude Code loads EmDash's skills.

The deny rules match command prefixes, so they catch the common case, not every spelling. The repo's own
enforcement (branch protection, CI, the pre-commit hook, no production credentials) is the backstop.
Personal overrides go in `settings.local.json` (gitignored).
