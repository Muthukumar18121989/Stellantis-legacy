# TwinX UI — the TwinX legacy design system

Everything needed to rebuild any screen of the Stellantis Promotool (TwinX legacy) app exactly, by
hand or with an AI coding tool (Claude Code, GitHub Copilot, Google Antigravity, Cursor, Gemini CLI,
Codex…), and then change only the content.

Plain HTML/CSS/JS. No build step, no framework, no npm. Open `index.html` in a browser.

## What is in this folder

| Path | Contents |
|---|---|
| `index.html` | **Catalogue** (Storybook-like): foundations, 60 components with live preview and copyable code, 19 page templates. Works from `file://`. |
| `kit/` | The legacy site copied verbatim: 19 pages (= **page templates**) and the runtime `css/ js/ fonts/ assets/`. |
| `components/` | One standalone HTML file per component, cut verbatim from a page. Copy what is between `snippet:start` and `snippet:end`. |
| `tokens/` | `tokens.json` (source of truth) and `tokens.css` (`--tx-*` variables, `.tx-type-*` helpers). |
| `registry.json` | Machine-readable index of templates and components for AI tools. |
| `AGENTS.md` | The rules every AI tool must follow (CLAUDE.md imports it). |
| `ai/project-root/` | Ready rule files for a new project: `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.agent/rules/twinx-ui.md` (Antigravity), `GEMINI.md`, `.cursor/rules/twinx-ui.mdc`. |
| `STARTER_PROMPT.md` | The prompt a designer pastes into a new project. |
| `scripts/install.sh` | Sets up a project (runtime folders + rule files) without AI. |
| `scripts/build.py` | Re-syncs everything from the legacy pages (maintainers only). |

## Use it in a new client project

1. Copy this `design-system/` folder into the root of the new project.
2. Open the project in your AI tool and paste `STARTER_PROMPT.md` once. The AI reads the rules, runs
   `scripts/install.sh` (copies `css/ js/ fonts/ assets/` and the rule files to the project root) and
   lists the pages it can make. Without AI: `bash design-system/scripts/install.sh`.
3. Ask for pages: *"Make the experiment list page."* gives a byte-for-byte copy of
   `kit/experiments.html`. *"…for Battery Campaigns, with columns ID, Campaign, Market, Status and
   6 rows"* keeps the layout and swaps the content.

Project-specific styles go in `css/app.css` (created by the installer, loaded last, uses the
tokens). Never edit the kit CSS/JS or this folder; replace the folder to update.

## Rules in one breath

Exact copy first, content changes only · class names and structure untouched · one Stellantis
Promotool logo · fluid from 1280px, no mobile layout · thin visible scrollbars · icons only from
`assets/icons/` · new styling only with `--tx-*` tokens in `css/app.css`.

## Keep it in sync with the legacy app

The pages at the repository root are the source of truth. After changing them:

```
python3 design-system/scripts/build.py
```

That refreshes `kit/`, every component, `tokens.css`, `registry.json`, the catalogue data and the
rule files. To add a component, add a `comp(...)` line in `scripts/build.py` (page + opening tag).
