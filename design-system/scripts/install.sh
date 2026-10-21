#!/usr/bin/env bash
# Set up a project to use TwinX UI. Run from anywhere:  bash design-system/scripts/install.sh [project-root]
# - copies the runtime (css, js, fonts, assets) from design-system/kit/ to the project root
#   (library files are overwritten so they match the design system; css/app.css is never touched)
# - copies the AI rules files (CLAUDE.md, AGENTS.md, Copilot, Antigravity, Gemini, Cursor) to the project root,
#   skipping any that already exist (merge those by hand: append design-system/ai/RULES.md)
set -euo pipefail
DS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="${1:-$(dirname "$DS")}"
ROOT="$(cd "$ROOT" && pwd)"

for d in css js fonts assets; do
  mkdir -p "$ROOT/$d"
  cp -R "$DS/kit/$d/." "$ROOT/$d/"
done
[ -f "$ROOT/css/app.css" ] || printf '/* Project styles for TwinX UI pages. Load last. Use var(--tx-*) tokens and the .app- prefix. */\n@import url("../design-system/tokens/tokens.css");\n' > "$ROOT/css/app.css"

cd "$DS/ai/project-root"
find . -type f | while read -r f; do
  dest="$ROOT/${f#./}"
  if [ -e "$dest" ]; then
    echo "skip (exists): ${f#./}  -> append design-system/ai/RULES.md to it yourself"
  else
    mkdir -p "$(dirname "$dest")"
    cp "$f" "$dest"
    echo "added: ${f#./}"
  fi
done
echo "TwinX UI ready in $ROOT. Open design-system/index.html to browse components and templates."
