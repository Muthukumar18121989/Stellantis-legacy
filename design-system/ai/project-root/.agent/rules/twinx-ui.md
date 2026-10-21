---
trigger: always_on
---

# TwinX UI — rules for AI coding tools

This project builds screens in the **TwinX legacy design system** (the Stellantis Promotool app).
The design system lives in `design-system/` at the project root. Every page you produce must look
**exactly** like the legacy app. The designer then changes the content (titles, labels, columns,
rows, numbers, links), never the look.

Read this whole file before writing any UI. When in doubt, copy more of the legacy markup, not less.

## 1. Where things are

| Path | What it is |
|---|---|
| `design-system/kit/*.html` | The 19 legacy pages: the **page templates**. |
| `design-system/kit/css/` `js/` `fonts/` `assets/` | The **runtime** (library CSS, behaviour JS, self-hosted fonts, icons, illustrations, logo). |
| `design-system/components/<id>.html` | One file per **component**, cut verbatim from a page. Copy only what is between `<!-- snippet:start -->` and `<!-- snippet:end -->`. The comment at the top lists the CSS/JS it needs. |
| `design-system/registry.json` | Machine-readable index: every template (CSS, JS, dialogs, regions) and component (file, CSS, JS). Look things up here first. |
| `design-system/tokens/tokens.css` / `tokens.json` | Colour, type, radius, shadow, spacing and layout tokens (`--tx-*`) for anything new. |
| `design-system/index.html` | The browsable catalogue (open in a browser). |

**Project layout (set up once):** the runtime folders are copied from `design-system/kit/` to the
project root, so the project root looks like the legacy site:

```
css/  js/  fonts/  assets/      <- copied unchanged from design-system/kit/
css/app.css                      <- the ONLY project stylesheet you may write (loaded last)
index.html, experiments.html …   <- pages, at the project root
design-system/                   <- read-only reference, never edited
```

If `css/base.css` does not exist at the project root yet, run setup first:
`bash design-system/scripts/install.sh` (or copy `design-system/kit/{css,js,fonts,assets}` to the root).
Never rewrite paths inside templates or snippets: `css/…`, `js/…`, `assets/…` are relative to the
project root exactly as in the legacy app.

## 2. "Make the <X> page" — the exact-copy workflow

1. Find the template in the table below (or by name/purpose in `registry.json` → `templates`).
2. Copy `design-system/kit/<file>` to the project root **byte for byte** (same file name unless the
   designer gives another one). Do not retype it, do not "clean it up", do not reformat it.
3. Apply only the content changes the designer asked for (section 3). If they asked for nothing
   else, stop: the copy is the answer.
4. Keep every `<link rel="stylesheet">` and `<script>` the template has, in the same order. Add
   `<link rel="stylesheet" href="css/app.css">` last only if you wrote project CSS.
5. If the page links to other pages that do not exist in the project yet, keep the links (they will
   be created later) unless the designer says otherwise.
6. Verify (section 8).

| Ask (any wording like this) | Template file | Role |
|---|---|---|
| login, sign in | `index.html` | all |
| experiment list, experiments page, promotion list, home (pilot) | `experiments.html` | Promotion Pilot |
| promotool dashboard, promotion dashboard, promotion level dashboard | `promotool-dashboard.html` | Promotion Pilot |
| promotion configuration, create promotion, configure parameters | `promotion-configuration.html` | Promotion Pilot |
| selection & analysis, article selection, families, volume / price analysis | `selection-analysis.html` | Promotion Pilot |
| simulation results, results page | `simulation-result.html` | Promotion Pilot |
| logistics volume split, pre-order volume split | `logistics-volume-split.html` | Promotion Pilot |
| workflow tracker, approval lifecycle | `workflow-tracker.html` | Promotion Pilot |
| experiment compare, compare promotions | `compare.html` | Promotion Pilot |
| reports, report hub, advanced analytics | `reports.html` | Promotion Pilot |
| approval dashboard, experiment status, admin home | `experiment-status.html` | Admin |
| admin dashboard, promotion admin dashboard | `dashboard.html` | Admin |
| DOA rules, delegation of authority | `doa-rules.html` | Admin |
| user management, user list | `user-management.html` | Admin |
| create user, edit user, delegates | `user-edit.html` | Admin |
| bulk upload preview | `user-bulk-preview.html` | Admin |
| role management | `role-management.html` | Admin |
| create role | `role-create.html` | Admin |
| referential, master data | `referential.html` | Admin |

## 3. Changing content (allowed) vs. changing the design (not allowed)

**Allowed — do these freely when asked:**
- Change any visible text: titles, breadcrumb, labels, placeholders, button text, badge text, numbers, dates, names.
- Tables: add/remove/reorder `<tr>` rows; add/remove/rename columns — when you change columns,
  update `<thead>`, every row, **and** the `<colgroup>` widths so the total stays the same.
- Lists, tabs, filter fields, cards, stepper steps, options in selects: duplicate or remove the
  repeated element (copy an existing sibling and edit its text). Keep 1 active/current item.
- Status badges: pick the existing variant that fits (`badge--progress` teal, `badge--pending` yellow, `badge--iteration` blue; see the catalogue for others).
- Swap icons for another file from `assets/icons/` with the same size and colour variant.
- Change `href` targets and page `<title>`.
- Remove a whole region the designer does not want (each region is marked by an HTML comment).
- Add a dialog by copying an existing one (`<dialog>` + `showModal()` + `[data-close-dialog]`).

**Not allowed — never do these:**
- Rename, remove or invent class names on legacy elements, or change element nesting.
- Edit any file copied from `design-system/kit/` (`css/*.css`, `js/*.js`) or anything in `design-system/`.
- Add colours, fonts, font sizes, radii or shadows that are not in `tokens.json`.
- Add inline `style=""` except the fixed widths the legacy markup already uses.
- Replace the markup with Tailwind, Bootstrap, MUI, shadcn or any other UI kit, or "modernise" it.
- Add a second logo, "Powered by" text or another brand mark.
- Add a mobile layout or breakpoints below 1280px.
- Hide scrollbars (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`).

## 4. New pages that have no template

1. Start from the **App shell** component (`design-system/components/app-shell.html`): `.page` >
   `.left-bar` + `.main` > `.top-menu` + body. Use `left-bar-admin` for admin pages.
2. Add a page header (`page-header-*` components) and the components you need, copied from
   `design-system/components/`.
3. **CSS combinations:** page CSS files are written per page and some class names (for example
   `.breadcrumb`) exist in several of them. Load `css/base.css`, then the page CSS of the template
   your components come from, then `css/user-menu.css`, exactly as that template does. Prefer
   components from one template family per page:
   - pilot list pages → `experiment.css`
   - flow pages (configuration, selection, results, split, tracker) → `configuration.css` (+ `result.css`, `validation.css`, `workflow.css` as the template does)
   - reports / compare → `configuration.css` + `reports.css` (+ `compare.css`)
   - admin pages → `configuration.css` + `admin.css`
4. Give `.page` the modifier class of that family (`page--experiment`, `page--configuration`,
   `page--admin page--users`, …) because some rules are scoped to it.

## 5. New components that are not in the library

Only when nothing in the catalogue fits:
- Write them in `css/app.css`, prefixed `.app-`, using only `var(--tx-…)` tokens (link
  `design-system/tokens/tokens.css` before `css/app.css`, or copy the `:root` block into app.css).
- Copy the anatomy of the closest legacy component: 32px controls, 6px control radius, 12px card
  radius, 1px `#bfe0f5` / `#ccdde8` borders, white cards on the `#d4edfd` page, Noto Sans labels,
  Poppins buttons/tables, Open Sans 24px page titles in `#196c9b`.
- Icons: only files from `assets/icons/` (Tabler set). Never inline new SVG icons or icon fonts.

## 6. Site-wide rules

- **One logo:** `.top-menu__logo > .brand > img.brand__logo` with `assets/logo-promotool.png` (190×28) on every signed-in page.
- **Fluid layout from 1280px:** `.page` is 100% wide with `min-width: 1280px`; narrower windows scroll sideways. Wide tables keep their width and scroll inside their frame.
- **Scrollbars** are thin and visible (set once in base.css).
- **Left bar:** pilot pages show Dashboard / Experiments / Reports; admin pages show Home / DOA / Users / Roles / Referential. Mark the current page with `left-bar__item--active`, `aria-current="page"` and the `-blue` icon variant when one exists.
- **Top menu:** keep notifications, language and profile. Include `css/user-menu.css` and
  `js/user-menu.js` on every signed-in page (it builds the user menu and settings dialog).
- **Process flows** use the shared `.stepper` (done = green check, current = blue pill, todo = grey).
- **Tooltips:** add `data-tooltip="Text"` to a button (style in base.css); icon-only buttons also keep an `aria-label`.
- **Dialogs:** native `<dialog>`, opened with `showModal()`, closed by `[data-close-dialog]` buttons.
- Keep the accessibility attributes the legacy markup has (`aria-label`, `aria-current`, `role`).

## 7. If the project uses a framework (React, Angular, Vue, Svelte…)

Keep the same HTML structure and class names inside the components (`class` → `className` in
React), import the kit CSS files globally in the same order, serve `fonts/` and `assets/` as static
files at the same paths, and port the small `js/*.js` behaviours into component code. Do not
replace the markup with a component library.

## 8. Verify before you say it is done

- Open the page in a browser (or Playwright) at **1366×768**, then 1280 and 1920.
- Compare with `design-system/kit/<template>.html` side by side: same header, left bar, spacing,
  fonts, colours; only the content differs.
- No 404s in the console (CSS, fonts, icons).
- Only `css/app.css` and the page HTML changed; nothing under `css/` from the kit or `design-system/`.
- Tell the designer which template you started from and which content you changed.
