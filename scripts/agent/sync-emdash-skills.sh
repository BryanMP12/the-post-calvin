#!/usr/bin/env bash
# Replaces .agents/skills/ with EmDash's agent skills from its blog template at a release tag.
# Run it when the installed emdash version changes, then review the diff.
# Usage: scripts/agent/sync-emdash-skills.sh <emdash version, e.g. 1.5.0>
set -euo pipefail
version="${1:?usage: $0 <emdash version>}"
root="$(git rev-parse --show-toplevel)"
cd "$root"
if [ -n "$(git status --porcelain -- .agents)" ]; then
  echo ".agents/ has uncommitted changes; commit or discard them first." >&2
  exit 1
fi
tmp="$(mktemp -d)"
trap 'rm -rf -- "$tmp"' EXIT
git clone --quiet --depth 1 --filter=blob:none --sparse --branch "emdash@${version}" \
  https://github.com/emdash-cms/emdash.git "$tmp/emdash" 2>/dev/null
git -C "$tmp/emdash" sparse-checkout set templates/blog/.agents/skills
src="$tmp/emdash/templates/blog/.agents/skills"
[ -d "$src" ] || { echo "No skills found at emdash@${version}." >&2; exit 1; }
mkdir -p .agents/skills
find .agents/skills -mindepth 1 -delete
cp -R "$src/." .agents/skills/
printf '%s\n' "$version" > .agents/emdash-skills-version
echo "Synced EmDash skills from emdash@${version}. Review with: git diff --stat -- .agents"
