#!/usr/bin/env bash
# Runs `pnpm check` if the working tree has changes (staged, unstaged or untracked).
# Agents run it before saying they're done. Exits with pnpm check's status (0 if clean).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi
pnpm check
