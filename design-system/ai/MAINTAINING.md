## 9. Maintaining the design system (only in the Stellantis-legacy repository)

The legacy pages at the repository root are the single source of truth. `design-system/kit/`,
`design-system/components/`, `registry.json`, `catalogue/manifest.js`, `tokens/tokens.css`,
`AGENTS.md`, `CLAUDE.md` and `ai/project-root/` are generated.

- Change a page or its CSS at the repository root, then run `python3 design-system/scripts/build.py`.
- Add or change a component: edit the `comp(...)` list in `scripts/build.py` (page, opening tag,
  description, preview size), then rebuild. Components are always cut from a page, never hand-written.
- Change tokens in `tokens/tokens.json`, rules in `ai/RULES.md`, the prompt in `STARTER_PROMPT.md`.
- After a rebuild, open `design-system/index.html` and check the changed components.
- Consuming projects update by replacing their `design-system/` folder and re-running `scripts/install.sh`.
