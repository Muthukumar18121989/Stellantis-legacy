You are building UI for a TwinX (Stellantis Promotool) project. This project uses the TwinX legacy
design system, which is in the folder `design-system/` at the project root. Every screen must look
exactly like the legacy TwinX app; I will only change the content (titles, labels, columns, rows,
numbers, links), never the look.

Do this setup once, now:
1. Read `design-system/AGENTS.md` completely, then skim `design-system/registry.json` so you know
   every page template and component.
2. If `css/base.css` is missing at the project root, run `bash design-system/scripts/install.sh`.
   If you cannot run commands, do what that script does: copy `design-system/kit/css`, `js`,
   `fonts` and `assets` to the project root unchanged, create an empty `css/app.css`, and copy the
   files in `design-system/ai/project-root/` (CLAUDE.md, AGENTS.md, .github/copilot-instructions.md,
   .agent/rules/twinx-ui.md, GEMINI.md, .cursor/rules/twinx-ui.mdc) to the project root without
   overwriting existing files.
3. Reply with a short list of the page templates you can make, then wait for my request.

From then on, for every request:
- "Make the <name> page" means: copy the matching template from `design-system/kit/` to the project
  root byte for byte, then apply only the content changes I ask for. Do not retype, restyle,
  reformat or "improve" it.
- For a page with no template, start from `design-system/components/app-shell.html` and copy
  components from `design-system/components/` (only the markup between snippet:start and
  snippet:end), loading the CSS files listed in each component's header.
- Never edit `design-system/` or the kit CSS/JS copied to the project. Project styles go only in
  `css/app.css`, using the `--tx-*` tokens.
- One logo only (`assets/logo-promotool.png`), fluid layout from 1280px, thin visible scrollbars,
  icons only from `assets/icons/`.
- When done, open the page at 1366×768 and compare it with the template, then tell me which
  template you used and what content you changed.
