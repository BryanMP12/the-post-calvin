#!/usr/bin/env bash
# Stop hook: runs the shared scripts/agent/check-if-dirty.sh before Claude finishes a turn.
# If `pnpm check` fails, exit 2 feeds the output back so Claude fixes it. It blocks once per turn:
# if Claude stops again while the hook is already active, it is let through to avoid a loop.
set -uo pipefail
active="$(jq -r '.stop_hook_active // false')"
[ "$active" = "true" ] && exit 0
if ! output="$("$CLAUDE_PROJECT_DIR/scripts/agent/check-if-dirty.sh" 2>&1)"; then
  {
    echo "pnpm check failed (scripts/agent/check-if-dirty.sh). Fix it before finishing (AGENTS.md \"Definition of done\")."
    printf '%s\n' "$output" | tail -n 80
  } >&2
  exit 2
fi
exit 0
