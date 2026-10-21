#!/usr/bin/env python3
"""Rebuild the TwinX UI design system from the legacy pages.

The legacy site (the repository root: *.html, css/, js/, fonts/, assets/) is the single source of truth.
This script, run from anywhere:

  1. copies the legacy site verbatim into design-system/kit/   (runtime + page templates)
  2. cuts each component out of a kit page, verbatim, into design-system/components/<id>.html
  3. writes tokens/tokens.css from tokens/tokens.json
  4. writes registry.json (machine-readable map for AI tools) and catalogue/manifest.js (the catalogue's data)
  5. writes the AI rule files for a consuming project into ai/project-root/

Usage:  python3 design-system/scripts/build.py [path/to/legacy/root]
Nothing here is needed to *use* the design system; it only keeps it in sync with the legacy pages.
"""
import html
import json
import re
import shutil
import sys
import textwrap
from pathlib import Path

DS = Path(__file__).resolve().parent.parent
LEGACY = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DS.parent
KIT = DS / "kit"
COMP = DS / "components"

# ---------------------------------------------------------------- templates (one per legacy page)
TEMPLATES = [
    # file, name, role, group, purpose
    ("index.html", "Login", "all", "Entry", "Sign-in screen: brand showcase on the left, form on the blue slanted panel. Demo users: Marcus Weber / user123 (Promotion Pilot, lands on experiments.html), Kristen / admin123 (Admin, lands on experiment-status.html)."),
    ("experiments.html", "Experiments list", "pilot", "Promotion Pilot", "Main landing page of the Promotion Pilot: the Promotion Optimization card fills the page (Products / Network cards are in the markup but hidden). My Projects is a collapsible rail on its left (collapsed by default); the filter bar sits inside the panel above the table; the header reads '<project> - Promotion Optimization'. Holds the New Promotion and Workflow History dialogs."),
    ("promotool-dashboard.html", "Promotool dashboard", "pilot", "Promotion Pilot", "Promotion-level dashboard: title bar with stepper and tags, configuration, KPIs, pacing/budget trackers, revenue and demand charts, financial summary, approval history."),
    ("promotion-configuration.html", "Promotion configuration", "pilot", "Promotion flow", "Step 1 of the promotion flow: configuration form (name, ID, type, market, applicability, brand, execution window) with Back / Next."),
    ("selection-analysis.html", "Selection & analysis", "pilot", "Promotion flow", "Step 2: Article Selection Core bar, empty state, family panels, article drill-down with Exclusions / Volume Analysis / Price Analysis tabs for all six promotion types, and the Select Family dialog."),
    ("simulation-result.html", "Simulation results", "pilot", "Promotion flow", "Step 3: promotion summary, tabbed results (Financial Outcome Summary KPIs, Metric Comparison, Promotion Drilldown, Top & Low Articles) and page actions."),
    ("logistics-volume-split.html", "Logistics volume split", "pilot", "Promotion flow", "Pre-order volume split by family and month with article drill-down; Submit for Approval dialog."),
    ("workflow-tracker.html", "Workflow tracker", "pilot", "Promotion flow", "Promotion tracking lifecycle (stages and steps), high level targets, family & article validation table; Volume Split Needed and Validator Comments dialogs."),
    ("compare.html", "Experiment compare", "pilot", "Reports", "Side-by-side compare of 2-3 experiments: configuration summary, product & pricing, output metrics."),
    ("reports.html", "Report hub", "pilot", "Reports", "Report hub with tabs: stage tracker, performance summary tiles, tracking table; Advanced Analytics tab with elasticity chart and markets table; Customize Your Report dialog."),
    ("experiment-status.html", "Approval dashboard", "admin", "Admin", "Admin landing page (Kristen): Products / Network cards, filters, promotion approval table with status tabs; approve / reject and Workflow History dialogs."),
    ("dashboard.html", "Admin dashboard", "admin", "Admin", "Promotion admin dashboard: page header, filters, region tabs, NSC / Importers segments, pie charts, stat cards, requests table."),
    ("doa-rules.html", "DOA rules", "admin", "Admin", "Delegation of Authority rules table with the parameter side panel dialog."),
    ("user-management.html", "User management", "admin", "Admin", "User list table with search, sort and status."),
    ("user-edit.html", "User create / edit", "admin", "Admin", "User details form, delegates, bulk upload and saved dialogs."),
    ("user-bulk-preview.html", "User bulk preview", "admin", "Admin", "Preview table of bulk-uploaded users with saved dialog."),
    ("role-management.html", "Role management", "admin", "Admin", "Role summary counts and capability legend, roles table."),
    ("role-create.html", "Role create", "admin", "Admin", "Create role form with capability checkboxes and saved dialog."),
    ("referential.html", "Referential", "admin", "Admin", "Referential data: filters, tabs and several data table cards."),
]

# ---------------------------------------------------------------- components
# Each component is cut verbatim out of a kit page. `start` is the opening tag text; the element is taken up to its
# matching close tag. `parts` concatenates several cuts (same page) into one gallery. CSS/JS default to the page's.
C = []
def comp(id, name, cat, page, start=None, nth=1, desc="", width=1000, height=None, parts=None, open=None,
         js=(), replace=(), gallery=False, scope=None, after=""):
    C.append(dict(id=id, name=name, category=cat, page=page, start=start, nth=nth, desc=desc, width=width,
                  height=height, parts=parts, open=open, js=list(js), replace=list(replace), gallery=gallery,
                  scope=scope, after=after))

# App shell
comp("app-shell", "App shell", "App shell", "experiments.html", desc="Page frame used by every signed-in page: .page > .left-bar + .main > .top-menu + page body. Fluid from 1280px; the left bar runs full height. Start every new page from this (or from a template).", width=1366, height=420)
comp("left-bar-pilot", "Left menu bar (Promotion Pilot)", "App shell", "experiments.html", '<nav class="left-bar"', desc="60px gradient bar. Items: Promotool Dashboard (grid-dots), Experiments (route), Reports (report-analytics). Mark the current page with .left-bar__item--active + aria-current and the -blue icon variant where one exists.", width=120, height=300)
comp("left-bar-admin", "Left menu bar (Admin)", "App shell", "doa-rules.html", '<nav class="left-bar"', desc="Admin variant: Home, DOA Rules, User Management, Role Management, Referential.", width=120, height=380)
comp("top-menu", "Top menu", "App shell", "experiments.html", '<header class="top-menu"', desc="56px white bar: the single Stellantis Promotool logo, notifications, language, profile (name + role). Clicking the profile opens the user menu (js/user-menu.js).", width=1306, height=110)
comp("user-menu", "User menu & settings", "App shell", "experiments.html", '<header class="top-menu"', js=["user-menu.js"], desc="Built by js/user-menu.js from the profile name/role in the top menu: a menu with Settings and Log Out; Settings opens the User Settings dialog. Include css/user-menu.css and js/user-menu.js on every signed-in page.", width=1306, height=520, after="<script>setTimeout(function(){var p=document.querySelector('.profile');p&&p.click();},50)</script>")
comp("page-header-flow", "Page header with stepper", "Page headers", "promotion-configuration.html", '<section class="cfg-header"', desc="Breadcrumb + 24px page title + compact stepper on one bar. Used by the promotion flow pages.", width=1306, height=120)
comp("page-header-result", "Page header with stepper and actions", "Page headers", "simulation-result.html", '<section class="res-header"', desc="Results variant: breadcrumb, title, stepper and right-side actions (iteration switch).", width=1306, height=120)
comp("page-header-report", "Page header with download", "Page headers", "reports.html", '<section class="rp-header"', desc="Report hub header: breadcrumb, title and Download button.", width=1306, height=120)
comp("page-header-admin", "Admin page header", "Page headers", "doa-rules.html", '<header class="ad-header"', desc="Admin header with breadcrumb, title and subtitle.", width=1306, height=140)
comp("page-header-dashboard", "Dashboard page header", "Page headers", "dashboard.html", '<section class="page-header"', desc="Admin dashboard header: breadcrumb and title.", width=1306, height=120)
comp("breadcrumb", "Breadcrumb", "Navigation", "promotion-configuration.html", '<nav class="breadcrumb"', desc="Home icon / links / current page. Separators are .breadcrumb__sep.", width=600, height=80)
comp("stepper", "Stepper", "Navigation", "promotion-configuration.html", '<ol class="stepper"', desc="Shared one-line stepper (css/base.css). States: .stepper__step--done (green check), --current (blue pill), --todo (grey). Every process flow uses it.", width=700, height=80)
comp("tabs-underline", "Tabs (underline)", "Navigation", "dashboard.html", '<div class="tabs"', desc="Region tabs with an underline bar on the active tab.", width=700, height=90)
comp("segments", "Segmented control", "Navigation", "dashboard.html", '<div class="segments"', desc="Two-option segmented switch (NSC / Importers).", width=500, height=90)
comp("tabs-pill", "Tabs (result)", "Navigation", "simulation-result.html", '<div class="res-tabs-row"', desc="Tab row with filters on the right, used on the results page (.art-tabs / .art-tab).", width=1260, height=90)
comp("pagination", "Table footer & pagination", "Navigation", "experiments.html", '<div class="table-footer"', desc="'Showing x to y of z entries' + page buttons. Current page: .pagination__page--current + aria-current.", width=700, height=80)

# Buttons & inputs
comp("buttons-core", "Buttons (core)", "Buttons & inputs", "experiments.html", desc="Primary button, icon button, square add button and the dialog Create button.", width=700, height=110, gallery=True,
     parts=[('<button class="btn-primary"', 1), ('<button class="icon-btn"', 1), ('<button class="icon-btn"', 2), ('<button class="btn-square"', 1), ('<button class="btn-create"', 1)])
comp("buttons-flow", "Buttons (flow)", "Buttons & inputs", "selection-analysis.html", desc="Outline (Back / Cancel), Next, Validate, outline-with-icon, 'N Selected' and primary icon buttons used on the flow pages (css/configuration.css).", width=900, height=110, gallery=True,
     parts=[('<a class="btn-outline"', 1), ('<button class="btn-next" type="button" data-p', 1), ('<button class="btn-validate"', 1), ('<button class="btn-outline-icon"', 1), ('<button class="btn-selected"', 1), ('<button class="btn-icon-primary"', 1)])
comp("buttons-admin", "Buttons (admin)", "Buttons & inputs", "role-create.html", desc="Admin form buttons: secondary (link) and primary.", width=500, height=110, gallery=True,
     parts=[('<a class="ad-btn"', 1), ('<button class="ad-btn ad-btn--primary"', 1)])
comp("filters", "Filter bar", "Buttons & inputs", "experiments.html", '<section class="filters"', desc="Label-over-select fields that stretch to the action buttons (Refresh, Apply, Download). Change labels/values; keep the structure.", width=1260, height=130)
comp("filters-report", "Filter bar (reports)", "Buttons & inputs", "reports.html", '<section class="rp-filters"', desc="Report hub filter row with date range and Apply.", width=1260, height=130)
comp("search", "Search field", "Buttons & inputs", "experiments.html", '<label class="search"', desc="Search input with leading icon.", width=400, height=80)
comp("select", "Select dropdown", "Buttons & inputs", "experiments.html", '<div class="select" data-select>', desc="Custom listbox select (from the New Promotion dialog); js/new-promotion.js opens it and picks options.", width=700, height=90)
comp("form-config", "Configuration form", "Buttons & inputs", "promotion-configuration.html", '<form class="cfg-card"', desc="Label column + details column rows: text input with badge, disabled input, select + info badge, select + checkbox, radios, date window. Row heights: .cfg-row (default), --short, --tall.", width=1260, height=560)
comp("page-actions", "Page actions", "Buttons & inputs", "promotion-configuration.html", '<div class="cfg-actions"', desc="Back / Next pair at the bottom of a flow page.", width=1260, height=90)
comp("checkbox", "Checkbox", "Buttons & inputs", "experiments.html", '<input class="checkbox"', desc="Table checkbox (.checkbox).", width=200, height=70)

# Data display
comp("status-badges", "Status badges", "Data display", "experiments.html", desc="Status badge with dot (progress = teal: Draft / Active / Analysis Completed; pending = yellow: Planned / Submitted), and the iteration badge.", width=700, height=80, gallery=True,
     parts=[('<span class="badge badge--progress"', 1), ('<span class="badge badge--pending"', 1), ('<span class="badge badge--pending"', 2), ('<span class="badge badge--progress"', 2), ('<span class="badge badge--iteration"', 1)])
comp("analysis-badges", "Analysis badges", "Data display", "selection-analysis.html", desc="Level badge and elasticity chips used in the analysis tables (green / yellow / red).", width=600, height=80, gallery=True,
     parts=[('<span class="badge badge--level', 1), ('<span class="pr-badge pr-badge--green"', 1), ('<span class="pr-badge pr-badge--yellow"', 1), ('<span class="pr-badge pr-badge--red"', 1)])
comp("config-cards", "Products / Network cards", "Data display", "experiments.html", '<div class="config-cards"', desc="Two summary cards with icon, label, type list and decorative illustrations pinned to the right edge. Hidden on experiments.html (hidden attribute) until they have functionality; drop the attribute to show them.", width=1260, height=180, replace=[('<div class="config-cards" hidden>', '<div class="config-cards">')])
comp("promotion-table-card", "Projects + promotion table card", "Data display", "experiments.html", '<section class="projects-card"', desc="My Projects list (left, collapsible: data-projects=collapsed|expanded on the card, toggled by [data-projects-toggle] in js/experiment.js) and the Promotion Optimization panel (right): '<project> - Promotion Optimization' header with search and actions, the filter bar, the table with status badges, row actions and pagination. Picking a project renames the header. The core of the experiments list.", width=1260, height=560, js=["experiment.js"])
comp("data-table", "Data table", "Data display", "experiments.html", '<div class="table-wrap"', desc="Table in a bordered scroll frame (.table-wrap > table.promos). Column widths via <colgroup>. Row cells: .is-light (ID), .is-bold (name). Add/remove <tr> rows freely.", width=1000, height=320, scope="page--experiment optimization")
comp("stat-cards", "Stat cards", "Data display", "dashboard.html", '<div class="stats"', desc="Icon + label + big number tiles.", width=1260, height=130)
comp("chart-card", "Chart card", "Data display", "dashboard.html", '<section class="card"', desc="Card with title and a pie chart + legend.", width=640, height=360)
comp("requests-table", "Table card (admin dashboard)", "Data display", "dashboard.html", '<section class="table-card"', desc="Titled table card with pagination.", width=1260, height=460)
comp("kpi-cards", "KPI cards", "Data display", "simulation-result.html", '<div class="kpis"', desc="Result KPI cards: value, comparison, uplift arrow, alert line.", width=1260, height=330)
comp("result-summary", "Promotion summary bar", "Data display", "simulation-result.html", '<section class="res-summary"', desc="Promotion name and key facts (window, countries, brands, logic) on one bar.", width=1260, height=120)
comp("selection-core", "Article Selection Core bar", "Data display", "selection-analysis.html", '<section class="sel-summary"', desc="One 48px line: title | counts | Manage Families.", width=1260, height=90)
comp("empty-state", "Empty state", "Data display", "selection-analysis.html", '<section class="sel-empty"', desc="Illustration + message when nothing is selected yet.", width=1260, height=320)
comp("family-panel", "Family panel", "Data display", "selection-analysis.html", '<article class="fam-panel">', desc="Collapsible family panel with analysis cards and actions (Remove Family, Drill Down to Article). Filled from a <template> in the page.", width=1260, height=520, replace=[('<h3 class="fam-panel__title" data-family-title></h3>', '<h3 class="fam-panel__title" data-family-title>1109Z5 - Brake Pads</h3>')])
comp("trend-panel", "Monthly trend panel", "Data display", "selection-analysis.html", '<div class="trend" data-view="tiles">', desc="Monthly trend tiles with a tiles / graph switch (expanded under a volume row).", width=1260, height=300)
comp("article-view", "Article analysis view", "Data display", "selection-analysis.html", '<section class="art-view" data-tab="exclusions">', desc="Family drill-down: title, filter, Exclusions / Volume Analysis / Price Analysis tabs and the exclusions table with pagination.", width=1260, height=520, js=["selection-analysis.js"])
comp("lifecycle", "Lifecycle tracker", "Data display", "workflow-tracker.html", '<section class="wf-card wf-card--lifecycle"', desc="Promotion tracking lifecycle: stages with done / active / waiting steps; scrolls sideways.", width=1260, height=340)
comp("volume-split", "Volume split table card", "Data display", "logistics-volume-split.html", '<section class="vs-card" data-split>', desc="Family x month volume split with sticky columns, chips and pagination.", width=1260, height=560, js=["validation.js"])
comp("stage-tracker", "Stage tracker", "Data display", "reports.html", '<section class="rp-card rp-card--stages"', desc="Horizontal stage tracker with icons.", width=1260, height=180)
comp("summary-tiles", "Summary tiles", "Data display", "reports.html", '<section class="rp-card rp-card--summary"', desc="Performance summary tiles with uplift range.", width=1260, height=220)
comp("promo-title-bar", "Promotion title bar", "Data display", "promotool-dashboard.html", '<section class="pd-title"', desc="Promotion name, tags, stepper and Download on the Promotool Dashboard.", width=1300, height=140)
comp("admin-table-card", "Admin table card", "Data display", "user-management.html", '<section class="ad-card um-card"', desc="Admin card: title, search, sortable table, status, pagination.", width=1260, height=460)
comp("role-summary", "Role summary", "Data display", "role-management.html", '<section class="rm-summary"', desc="Role counts and capability legend.", width=1260, height=220)
comp("alerts", "Alert banners", "Feedback", "selection-analysis.html", desc="Success / error banners (Montserrat) shown after validation.", width=900, height=120, gallery=True,
     parts=[('<p class="fam-alert fam-alert--success"', 1), ('<p class="fam-alert fam-alert--error"', 1)], scope="page--selection")

# Dialogs
comp("dialog-new-promotion", "New Promotion dialog", "Dialogs", "experiments.html", '<dialog class="new-promo"', open="#new-promo", js=["new-promotion.js"], desc="Modal form: radios, select, text input, Create Promotion. Open with dialog.showModal(); [data-close-dialog] closes.", width=1100, height=520)
comp("dialog-workflow-history", "Workflow History dialog", "Dialogs", "experiments.html", '<dialog class="wh-dialog"', open="#workflow-history", desc="Promotion ID / name and an iteration history table with approved / rejected badges.", width=1100, height=640)
comp("dialog-approve", "Approve with comments dialog", "Dialogs", "experiment-status.html", '<dialog class="es-dialog" id="es-approve"', open="#es-approve", desc="Confirmation dialog with comments box (approve / reject).", width=900, height=460)
comp("dialog-select-family", "Select Family dialog", "Dialogs", "selection-analysis.html", '<dialog class="fam-dialog"', open="#select-family", desc="Search / upload families, validate, table with checkboxes and 'N Selected'. States via data-state: list, upload, validated.", width=1200, height=720)
comp("dialog-submit-approval", "Submit for Approval dialog", "Dialogs", "logistics-volume-split.html", '<dialog class="sa-dialog"', open="#submit-approval", desc="Radio choices and Proceed.", width=900, height=520)
comp("dialog-volume-split", "Volume Split Needed dialog", "Dialogs", "workflow-tracker.html", '<dialog class="sa-dialog vsn-dialog"', open="#volume-split", desc="Split inputs with totals check, reason box, Cancel / Confirm Split.", width=1000, height=620)
comp("dialog-validator-comments", "Validator Comments dialog", "Dialogs", "workflow-tracker.html", '<dialog class="wf-comments"', open="#validator-comments", desc="Comments thread per validator.", width=900, height=560)
comp("dialog-report-download", "Customize Your Report dialog", "Dialogs", "reports.html", '<dialog class="rp-download"', open="#report-download", desc="Checkbox table of report sections with PDF / CSV buttons.", width=1000, height=640)
comp("dialog-side-panel", "Side panel dialog", "Dialogs", "doa-rules.html", '<dialog class="pp-panel"', open="#doa-param", desc="Right-hand side panel with fields, levels and toggles (DOA parameter).", width=1300, height=700)
comp("dialog-saved", "Saved confirmation dialog", "Dialogs", "user-edit.html", '<dialog class="ad-dialog ad-dialog--saved"', open="#ue-saved", desc="Small success confirmation.", width=800, height=400)
comp("dialog-bulk-upload", "Bulk upload dialog", "Dialogs", "user-edit.html", '<dialog class="ad-dialog ad-dialog--bulk"', open="#ue-bulk", desc="File picker with template link.", width=900, height=480)


# ---------------------------------------------------------------- helpers
def read(p):
    return Path(p).read_text(encoding="utf-8")

def page_css(src):
    return re.findall(r'<link rel="stylesheet" href="css/([^"]+)"', src)

def page_js(src):
    return re.findall(r'<script src="js/([^"]+)"', src)

def page_scope(src):
    m = re.search(r'<div class="page ([^"]+)"', src)
    return m.group(1) if m else ""

def cut(src, start, nth=1):
    """Return the element that begins with `start` (nth occurrence), up to its matching close tag, dedented."""
    pos = -1
    for _ in range(nth):
        pos = src.find(start, pos + 1)
        if pos < 0:
            raise SystemExit(f"start not found: {start!r} (#{nth})")
    tag = re.match(r"<([a-zA-Z0-9]+)", start).group(1)
    if tag in ("input", "img"):
        end = src.index(">", pos) + 1
    else:
        depth, i = 0, pos
        pat = re.compile(r"<(/?)%s\b[^>]*>" % tag)
        for m in pat.finditer(src, pos):
            depth += -1 if m.group(1) else 1
            if depth == 0:
                end = m.end()
                break
        else:
            raise SystemExit(f"unclosed: {start!r}")
    line_start = src.rfind("\n", 0, pos) + 1
    indent = src[line_start:pos]
    text = src[pos:end]
    if indent.strip() == "":
        text = indent + text
    return textwrap.dedent(text)

def build_snippet(c, src):
    if c["id"] == "app-shell":
        left = cut(src, '<nav class="left-bar"')
        top = cut(src, '<header class="top-menu"')
        body = '<main class="exp-body">\n  <!-- Page content: cards, filters, tables. Copy components from the catalogue. -->\n</main>'
        ind = lambda s, n: textwrap.indent(s, " " * n)
        return ('<div class="page page--experiment">\n\n' + ind(left, 2) + '\n\n  <div class="main">\n\n' + ind(top, 4) + '\n\n' + ind(body, 4) + '\n  </div>\n</div>')
    if c["parts"]:
        return "\n".join(cut(src, s, n) for s, n in c["parts"])
    return cut(src, c["start"], c["nth"])

PREVIEW_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../kit/">
  <title>TwinX UI · {name}</title>
<!--
  TwinX UI component: {id}
  Name:     {name}
  Category: {category}
  CSS:      {css_list}
  JS:       {js_list}
  Source:   kit/{page} (cut verbatim by scripts/build.py; do not edit by hand, edit the legacy page and rebuild)
  Usage:    {desc}
  Copy the markup between snippet:start and snippet:end into a page that loads the CSS above.
  Paths (assets/..., css/...) are relative to the site root, exactly as in the legacy pages.
-->
{links}
  <link rel="stylesheet" href="../components/preview.css">
</head>
"""

def write_component(c):
    src = read(KIT / c["page"])
    css = page_css(src)
    js = c["js"]
    snippet = build_snippet(c, src)
    for a, b in c["replace"]:
        snippet = snippet.replace(a, b)
    scope = c["scope"] if c["scope"] is not None else page_scope(src)
    links = "\n".join(f'  <link rel="stylesheet" href="css/{f}">' for f in css)
    head = PREVIEW_HEAD.format(id=c["id"], name=c["name"], category=c["category"], page=c["page"],
                               css_list=", ".join("css/" + f for f in css), js_list=", ".join("js/" + f for f in js) or "none",
                               desc=c["desc"].replace("--", "&#45;&#45;"), links=links)
    shell = c["id"] == "app-shell"
    body_cls = "ds-preview ds-preview--shell" if shell else "ds-preview"
    wrap_open = "" if shell else f'<div class="ds-scope {scope}">' + ('<div class="ds-gallery">' if c["gallery"] else "")
    wrap_close = "" if shell else ('</div>' if c["gallery"] else "") + "</div>"
    scripts = "".join(f'<script src="js/{f}"></script>\n' for f in js)
    opener = ""
    if c["open"]:
        opener = "<script>(function(){var d=document.querySelector(%s);if(d){d.removeAttribute('hidden');try{d.showModal()}catch(e){d.setAttribute('open','')}}})();</script>\n" % json.dumps(c["open"])
    out = (head + f'<body class="{body_cls}">\n{wrap_open}\n<!-- snippet:start -->\n{snippet}\n<!-- snippet:end -->\n{wrap_close}\n'
           + scripts + opener + c["after"] + "\n</body>\n</html>\n")
    (COMP / f'{c["id"]}.html').write_text(out, encoding="utf-8")
    return dict(id=c["id"], name=c["name"], category=c["category"], description=c["desc"], file=f'components/{c["id"]}.html',
                source=f'kit/{c["page"]}', css=["css/" + f for f in css], js=["js/" + f for f in js],
                width=c["width"], height=c["height"], snippet=snippet)

def sections(src):
    """Commented regions of a page body, in order: the legacy pages label each block with an HTML comment."""
    body = src[src.find("<body"):]
    out = []
    for m in re.finditer(r"<!--\s*(.*?)\s*-->\s*\n?\s*<([a-z]+)([^>]*)>", body, re.S):
        label = re.sub(r"\s+", " ", m.group(1)).strip()
        cls = re.search(r'class="([^"]+)"', m.group(3))
        ident = re.search(r'id="([^"]+)"', m.group(3))
        sel = m.group(2) + ("." + cls.group(1).split()[0] if cls else "") + ("#" + ident.group(1) if ident else "")
        out.append(dict(label=label, element=sel))
    return out

def write_tokens_css(tokens):
    lines = ["/* TwinX UI design tokens. Generated from tokens.json by scripts/build.py; do not edit by hand.",
             "   The legacy CSS (css/*.css) hard-codes these values; use the variables for anything new. */", ":root {"]
    def walk(prefix, node):
        for k, v in node.items():
            if k.startswith("$"):
                continue
            if isinstance(v, dict) and "value" in v:
                lines.append(f"  --tx-{prefix}{k}: {v['value']};" + (f" /* {v['use']} */" if v.get("use") else ""))
                if "letterSpacing" in v:
                    lines.append(f"  --tx-{prefix}{k}-tracking: {v['letterSpacing']};")
                if "color" in v and prefix.startswith("type"):
                    lines.append(f"  --tx-{prefix}{k}-color: {v['color']};")
            elif isinstance(v, dict):
                walk(f"{prefix}{k}-", v)
    for group in ("color", "gradient", "font", "type", "radius", "shadow", "space", "layout"):
        if group == "font":
            walk("font-", tokens["font"]["family"])
            continue
        lines.append(f"  /* {group} */")
        walk(f"{group}-", tokens[group])
    lines.append("}")
    # Utility classes that map the type tokens, for new markup only
    lines.append("\n/* Type helpers for new markup: <p class=\"tx-type-body\">…</p> */")
    for k, v in tokens["type"].items():
        rule = f"font: var(--tx-type-{k}); color: var(--tx-type-{k}-color);"
        if "letterSpacing" in v:
            rule += f" letter-spacing: var(--tx-type-{k}-tracking);"
        lines.append(f".tx-type-{k} {{ {rule} }}")
    (DS / "tokens" / "tokens.css").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    # 1. kit = verbatim copy of the legacy site
    if KIT.exists():
        shutil.rmtree(KIT)
    KIT.mkdir()
    for d in ("css", "js", "fonts", "assets"):
        shutil.copytree(LEGACY / d, KIT / d)
    for f in sorted(LEGACY.glob("*.html")):
        shutil.copy2(f, KIT / f.name)

    # 2. components
    for old in COMP.glob("*.html"):
        old.unlink()
    comps = [write_component(c) for c in C]

    # 3. tokens
    tokens = json.loads(read(DS / "tokens" / "tokens.json"))
    write_tokens_css(tokens)

    # 4. templates + registry + manifest
    templates = []
    for f, name, role, group, purpose in TEMPLATES:
        src = read(KIT / f)
        templates.append(dict(id=f[:-5], name=name, file=f"kit/{f}", role=role, group=group, purpose=purpose,
                              title=re.search(r"<title>(.*?)</title>", src).group(1),
                              css=["css/" + x for x in page_css(src)], js=["js/" + x for x in page_js(src)],
                              pageClass=page_scope(src), dialogs=re.findall(r'<dialog class="[^"]*" id="([^"]+)"', src),
                              sections=sections(src)))
    icons = sorted(p.name for p in (KIT / "assets" / "icons").glob("*.svg"))
    illus = sorted("illustrations/" + p.name for p in (KIT / "assets" / "illustrations").glob("*.svg")) + \
            sorted("shapes/" + p.name for p in (KIT / "assets" / "shapes").glob("*.svg"))
    registry = dict(
        name="TwinX UI (Stellantis Promotool legacy design system)",
        howToUse="See design-system/AGENTS.md. Pages: copy kit/<template>.html. Components: copy the snippet from components/<id>.html.",
        runtime=dict(css="kit/css", js="kit/js", fonts="kit/fonts", assets="kit/assets",
                     note="A consuming project copies these four folders to its web root unchanged, so every path in templates and snippets works as-is."),
        tokens=dict(json="tokens/tokens.json", css="tokens/tokens.css"),
        templates=templates,
        components=[{k: v for k, v in c.items() if k != "snippet"} for c in comps],
        icons=["assets/icons/" + i for i in icons],
    )
    (DS / "registry.json").write_text(json.dumps(registry, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    rules = read(DS / "ai" / "RULES.md")
    manifest = dict(tokens=tokens, templates=templates, components=comps, icons=icons, illustrations=illus,
                    starterPrompt=read(DS / "STARTER_PROMPT.md"), rules=rules)
    (DS / "catalogue" / "manifest.js").write_text(
        "/* Generated by scripts/build.py; do not edit. */\nwindow.TWINX_MANIFEST = " + json.dumps(manifest, ensure_ascii=False) + ";\n",
        encoding="utf-8")

    # 5. AI rule files: design-system/AGENTS.md (+ CLAUDE.md) and the copies for a consuming project
    (DS / "AGENTS.md").write_text(rules + "\n" + read(DS / "ai" / "MAINTAINING.md"), encoding="utf-8")
    (DS / "CLAUDE.md").write_text("@AGENTS.md\n", encoding="utf-8")
    root = DS / "ai" / "project-root"
    if root.exists():
        shutil.rmtree(root)
    variants = {
        "AGENTS.md": rules,
        "CLAUDE.md": "<!-- Claude Code project memory: TwinX UI rules (same text as AGENTS.md). -->\n\n" + rules,
        ".github/copilot-instructions.md": rules,
        ".agent/rules/twinx-ui.md": "---\ntrigger: always_on\n---\n\n" + rules,
        "GEMINI.md": rules,
        ".cursor/rules/twinx-ui.mdc": "---\ndescription: TwinX UI design system rules\nalwaysApply: true\n---\n\n" + rules,
    }
    for rel, text in variants.items():
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
    print(f"kit: {len(list(KIT.glob('*.html')))} pages · components: {len(comps)} · icons: {len(icons)} · templates: {len(templates)}")

if __name__ == "__main__":
    main()
