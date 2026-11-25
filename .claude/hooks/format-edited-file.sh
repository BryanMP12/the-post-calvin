#!/usr/bin/env bash
# PostToolUse hook: formats the file Claude just edited, via the shared scripts/agent/format-file.sh.
# Reads the hook's JSON from stdin. Never blocks: a formatting failure surfaces in `pnpm check` instead.
set -uo pipefail
path="$(jq -r '.tool_input.file_path // empty')"
[ -n "$path" ] && [ -f "$path" ] || exit 0
"$CLAUDE_PROJECT_DIR/scripts/agent/format-file.sh" "$path" || true
exit 0
