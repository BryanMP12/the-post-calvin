#!/usr/bin/env bash
# Formats one or more files with oxfmt. Agents run it after editing a file.
# File types oxfmt doesn't handle, and paths in .oxfmtrc.json's ignorePatterns, are skipped.
# Usage: scripts/agent/format-file.sh <path>...
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[ "$#" -eq 0 ] && { echo "usage: $0 <path>..." >&2; exit 2; }
pnpm exec oxfmt --no-error-on-unmatched-pattern -- "$@" >/dev/null
