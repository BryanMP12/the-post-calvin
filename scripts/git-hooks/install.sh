#!/usr/bin/env bash
# Points git at the repo's hooks. Run by `pnpm install` (root "prepare" script).
# Does nothing outside a git checkout (e.g. a tarball install).
set -euo pipefail
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git config core.hooksPath scripts/git-hooks
fi
