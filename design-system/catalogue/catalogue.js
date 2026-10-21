/* TwinX UI catalogue: a Storybook-like browser over catalogue/manifest.js. No build step, works from file://. */
(function () {
  var M = window.TWINX_MANIFEST;
  var nav = document.querySelector('[data-nav]');
  var view = document.querySelector('[data-view]');
  var search = document.querySelector('[data-search]');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function groupBy(list, key) {
    var out = [], seen = {};
    list.forEach(function (x) { if (!seen[x[key]]) { seen[x[key]] = []; out.push([x[key], seen[x[key]]]); } seen[x[key]].push(x); });
    return out;
  }
  function highlight(code) {
    return esc(code)
      .replace(/&lt;!--[\s\S]*?--&gt;/g, function (m) { return '<span class="c">' + m + '</span>'; })
      .replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="t">$2</span>')
      .replace(/ ([a-zA-Z-:@]+)=(&quot;[^&]*?&quot;)/g, ' <span class="a">$1</span>=<span class="v">$2</span>');
  }
  var toastEl = document.createElement('div'); toastEl.className = 'cat-toast'; document.body.appendChild(toastEl);
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 1600); }
  function copy(text, btn) {
    function done() { toast('Copied to clipboard'); if (btn) { var o = btn.textContent; btn.textContent = 'Copied'; btn.classList.add('is-done'); setTimeout(function () { btn.textContent = o; btn.classList.remove('is-done'); }, 1400); } }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) {} t.remove(); }
  }

  /* ---------- navigation ---------- */
  var foundations = [['colors', 'Colors'], ['typography', 'Typography'], ['shape', 'Radius, shadow & layout'], ['icons', 'Icons'], ['illustrations', 'Illustrations & shapes']];
  function buildNav(filter) {
    var f = (filter || '').toLowerCase();
    var match = function (s) { return !f || s.toLowerCase().indexOf(f) >= 0; };
    var h = '<p class="cat-nav__group">Start here</p>' +
      '<a href="#/start">Overview &amp; how to use</a><a href="#/prompt">Starter prompt for AI</a><a href="#/rules">Rules for AI tools</a>';
    h += '<p class="cat-nav__group">Foundations</p>' + foundations.filter(function (x) { return match(x[1]); }).map(function (x) { return '<a href="#/foundations/' + x[0] + '">' + x[1] + '</a>'; }).join('');
    h += '<p class="cat-nav__group">Components <span class="cat-nav__count">' + M.components.length + '</span></p><a href="#/components">All components</a>';
    groupBy(M.components.filter(function (c) { return match(c.name + ' ' + c.category + ' ' + c.id + ' ' + c.description); }), 'category').forEach(function (g) {
      h += '<p class="cat-nav__sub">' + esc(g[0]) + '</p>' + g[1].map(function (c) { return '<a href="#/components/' + c.id + '">' + esc(c.name) + '</a>'; }).join('');
    });
    h += '<p class="cat-nav__group">Page templates <span class="cat-nav__count">' + M.templates.length + '</span></p><a href="#/templates">All templates</a>';
    groupBy(M.templates.filter(function (t) { return match(t.name + ' ' + t.group + ' ' + t.id + ' ' + t.purpose); }), 'group').forEach(function (g) {
      h += '<p class="cat-nav__sub">' + esc(g[0]) + '</p>' + g[1].map(function (t) { return '<a href="#/templates/' + t.id + '">' + esc(t.name) + '</a>'; }).join('');
    });
    nav.innerHTML = h;
    markCurrent();
  }
  function markCurrent() {
    var hash = location.hash || '#/start';
    nav.querySelectorAll('a').forEach(function (a) { if (a.getAttribute('href') === hash) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }

  /* ---------- scaled preview frames ---------- */
  function preview(src, w, h, label, openHref) {
    return '<div class="cat-preview"><div class="cat-preview__bar"><span>' + esc(label) + '</span>' +
      '<a class="cat-btn cat-btn--line" href="' + esc(openHref || src) + '" target="_blank" rel="noopener">Open in new tab ↗</a></div>' +
      '<div class="cat-preview__stage" data-w="' + w + '" data-h="' + h + '"><iframe src="' + esc(src) + '" width="' + w + '" height="' + h + '" loading="lazy" title="' + esc(label) + '"></iframe></div></div>';
  }
  function fit() {
    view.querySelectorAll('.cat-preview__stage').forEach(function (st) {
      var w = +st.dataset.w, h = +st.dataset.h, cw = st.clientWidth || st.parentNode.clientWidth;
      var s = Math.min(1, cw / w);
      var f = st.querySelector('iframe');
      f.style.transform = 'scale(' + s + ')';
      st.style.height = Math.round(h * s) + 'px';
    });
  }
  window.addEventListener('resize', fit);

  function codeBlock(title, code, extra) {
    var id = 'c' + Math.random().toString(36).slice(2);
    setTimeout(function () {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () { copy(code, b); });
    });
    return '<div class="cat-code"><div class="cat-code__bar"><span>' + esc(title) + '</span>' + (extra || '') +
      '<button class="cat-btn" id="' + id + '" type="button">Copy</button></div><pre><code>' + highlight(code) + '</code></pre></div>';
  }
  function chips(label, list) {
    if (!list || !list.length) return '';
    return list.map(function (x) { return '<span class="cat-chip"><b>' + label + '</b>' + esc(x) + '</span>'; }).join('');
  }

  /* ---------- views ---------- */
  var V = {};
  V.start = function () {
    var n = M.components.length, t = M.templates.length;
    return '<div class="cat-wrap"><p class="cat-crumb">TwinX UI</p><h1 class="cat-h1">TwinX legacy design system</h1>' +
      '<p class="cat-lead">Every screen, component, font, icon and colour of the Stellantis Promotool (TwinX legacy) app, packaged so a designer or an AI coding tool can rebuild any page exactly and then change only the content. ' +
      n + ' components and ' + t + ' full page templates, plain HTML/CSS/JS with no build step.</p>' +
      '<h2 class="cat-h2">Use it in a new project</h2><div class="cat-steps">' +
      '<div class="cat-step"><h3>Copy the folder</h3><p>Copy <code>design-system/</code> into the root of the new project, unchanged.</p></div>' +
      '<div class="cat-step"><h3>Paste the starter prompt</h3><p>Open the project in Claude Code, Copilot, Antigravity or Cursor and paste the <a href="#/prompt">starter prompt</a> once. The AI installs the rules files and the runtime folders.</p></div>' +
      '<div class="cat-step"><h3>Ask for pages</h3><p>Say <q>make the experiment list page</q>. The AI copies the matching template exactly, then you ask it to change titles, columns, rows and labels.</p></div>' +
      '</div>' +
      '<h2 class="cat-h2">What is inside <code>design-system/</code></h2><div class="cat-card"><table class="cat-table"><tbody>' +
      '<tr><th>kit/</th><td>The legacy site, copied verbatim: <code>css/ js/ fonts/ assets/</code> (the runtime) and the ' + t + ' page templates (<code>kit/*.html</code>). Open any page directly in a browser.</td></tr>' +
      '<tr><th>components/</th><td>One standalone HTML file per component, cut verbatim out of a page. The markup between <code>snippet:start</code> and <code>snippet:end</code> is copy-ready.</td></tr>' +
      '<tr><th>tokens/</th><td><code>tokens.json</code> (source) and <code>tokens.css</code> (<code>--tx-*</code> variables + <code>.tx-type-*</code> helpers) for anything new.</td></tr>' +
      '<tr><th>registry.json</th><td>Machine-readable map of templates (CSS, JS, dialogs, sections) and components (file, CSS, JS) for AI tools.</td></tr>' +
      '<tr><th>AGENTS.md</th><td>The full rules for AI tools. <code>ai/project-root/</code> holds ready copies for CLAUDE.md, AGENTS.md, Copilot, Antigravity, Gemini and Cursor.</td></tr>' +
      '<tr><th>STARTER_PROMPT.md</th><td>The prompt a designer pastes into a new project.</td></tr>' +
      '<tr><th>scripts/</th><td><code>build.py</code> re-syncs everything from the legacy pages; <code>install.sh</code> sets up a project without AI.</td></tr>' +
      '</tbody></table></div>' +
      '<h2 class="cat-h2">Non-negotiables</h2><div class="cat-card"><table class="cat-table"><tbody>' +
      '<tr><th>Exact copy first</th><td>Start every page from a template or the app shell. Change text, numbers, rows, columns and links; keep class names, structure and CSS files.</td></tr>' +
      '<tr><th>One logo</th><td>Only <code>assets/logo-promotool.png</code> in <code>.top-menu__logo &gt; .brand</code>. No other brand marks.</td></tr>' +
      '<tr><th>Fluid from 1280px</th><td><code>.page</code> is 100% wide with <code>min-width: 1280px</code>; no mobile layout. Check at 1280, 1366 and 1920.</td></tr>' +
      '<tr><th>Thin visible scrollbars</th><td>Set once in base.css. Never hide scrollbars.</td></tr>' +
      '<tr><th>Library is read-only</th><td>Never edit <code>css/*.css</code> from the kit. Put project changes in <code>css/app.css</code>, loaded last, using tokens.</td></tr>' +
      '</tbody></table></div></div>';
  };
  V.prompt = function () {
    return '<div class="cat-wrap"><p class="cat-crumb">Start here</p><h1 class="cat-h1">Starter prompt</h1>' +
      '<p class="cat-lead">Paste this once into Claude Code, GitHub Copilot (agent mode), Google Antigravity or Cursor, in a project that has the <code>design-system/</code> folder at its root. It sets up the project; after that, just ask for pages.</p>' +
      codeBlock('STARTER_PROMPT.md', M.starterPrompt) +
      '<h2 class="cat-h2">Then ask, for example</h2><div class="cat-card">' +
      ['Make the experiment list page.', 'Make the experiment list page for "Battery Promotions": rename the table to "Battery Campaigns", columns ID, Campaign, Market, Start, End, Status; 6 sample rows.',
        'Make the promotion configuration page, but the form fields are: Campaign name, Market, Channel, Budget (€), Execution window.',
        'Add a new page "Supplier list" using the app shell, the admin header, the admin table card and pagination.',
        'Make the user management page with the admin left bar and 10 users.'].map(function (p) { return '<p class="cat-prompt"><q>' + esc(p) + '</q></p>'; }).join('') + '</div></div>';
  };
  V.rules = function () {
    return '<div class="cat-wrap"><p class="cat-crumb">Start here</p><h1 class="cat-h1">Rules for AI tools</h1>' +
      '<p class="cat-lead">The same rules go to every tool. The starter prompt copies these files from <code>design-system/ai/project-root/</code> into the project root (or run <code>bash design-system/scripts/install.sh</code>).</p>' +
      '<div class="cat-card"><table class="cat-table"><thead><tr><th>Tool</th><th>File it reads</th></tr></thead><tbody>' +
      '<tr><td>Claude Code</td><td><code>CLAUDE.md</code> (imports AGENTS.md)</td></tr>' +
      '<tr><td>GitHub Copilot (VS Code, agent / chat)</td><td><code>.github/copilot-instructions.md</code> and <code>AGENTS.md</code></td></tr>' +
      '<tr><td>Google Antigravity</td><td><code>.agent/rules/twinx-ui.md</code> (always on) and <code>AGENTS.md</code></td></tr>' +
      '<tr><td>Gemini CLI</td><td><code>GEMINI.md</code></td></tr>' +
      '<tr><td>Cursor</td><td><code>.cursor/rules/twinx-ui.mdc</code> and <code>AGENTS.md</code></td></tr>' +
      '<tr><td>Any other agent (Codex, Windsurf, Zed…)</td><td><code>AGENTS.md</code></td></tr>' +
      '</tbody></table></div>' + codeBlock('ai/RULES.md (content of every rules file)', M.rules) + '</div>';
  };

  V.colors = function () {
    var h = '<div class="cat-wrap"><p class="cat-crumb">Foundations</p><h1 class="cat-h1">Colors</h1><p class="cat-lead">Measured from the legacy CSS. Click a swatch to copy its variable. Legacy CSS hard-codes the hex values; new CSS uses <code>var(--tx-color-…)</code>.</p>';
    Object.keys(M.tokens.color).forEach(function (g) {
      h += '<h2 class="cat-h2">' + esc(g) + '</h2><div class="cat-swatches">';
      Object.keys(M.tokens.color[g]).forEach(function (k) {
        var t = M.tokens.color[g][k], v = '--tx-color-' + g + '-' + k;
        h += '<button class="cat-swatch" type="button" data-copy="var(' + v + ')"><div class="cat-swatch__chip" style="background:' + esc(t.value) + '"></div><div class="cat-swatch__body"><p class="cat-swatch__name">' + esc(k) + '</p><p class="cat-swatch__val">' + esc(t.value) + '<br>' + v + '</p>' + (t.use ? '<p class="cat-swatch__use">' + esc(t.use) + '</p>' : '') + '</div></button>';
      });
      h += '</div>';
    });
    h += '<h2 class="cat-h2">gradients</h2><div class="cat-swatches">';
    Object.keys(M.tokens.gradient).forEach(function (k) {
      var t = M.tokens.gradient[k];
      h += '<button class="cat-swatch" type="button" data-copy="var(--tx-gradient-' + k + ')"><div class="cat-swatch__chip" style="background:' + (k === 'left-bar' ? '' : '#47b695;') + 'background-image:' + esc(t.value) + '"></div><div class="cat-swatch__body"><p class="cat-swatch__name">' + esc(k) + '</p><p class="cat-swatch__use">' + esc(t.use) + '</p></div></button>';
    });
    return h + '</div></div>';
  };
  V.typography = function () {
    var h = '<div class="cat-wrap"><p class="cat-crumb">Foundations</p><h1 class="cat-h1">Typography</h1><p class="cat-lead">Fonts are self-hosted in <code>kit/fonts/</code> and declared in base.css. Noto Sans for UI text, Poppins for buttons, tables and badges, Open Sans for page titles, Montserrat for alerts.</p><div class="cat-card">';
    Object.keys(M.tokens.type).forEach(function (k) {
      var t = M.tokens.type[k];
      h += '<div class="cat-type"><p class="cat-type__meta"><b>' + esc(k) + '</b>' + esc(t.value) + (t.letterSpacing ? '<br>tracking ' + esc(t.letterSpacing) : '') + '<br>.tx-type-' + k + '</p>' +
        '<p style="font:' + esc(t.value) + ';letter-spacing:' + (t.letterSpacing || 'normal') + ';color:' + t.color + '">Spring Promotion 2026 — Discount on MSRP</p></div>';
    });
    h += '</div><h2 class="cat-h2">Families &amp; weights</h2><div class="cat-card"><table class="cat-table"><tbody>';
    Object.keys(M.tokens.font['weights-available']).forEach(function (f) {
      h += '<tr><th style="width:200px">' + esc(f) + '</th><td style="font-family:\'' + f + '\';font-size:16px">' + esc(M.tokens.font['weights-available'][f]) + '</td></tr>';
    });
    return h + '</tbody></table></div></div>';
  };
  V.shape = function () {
    var h = '<div class="cat-wrap"><p class="cat-crumb">Foundations</p><h1 class="cat-h1">Radius, shadow &amp; layout</h1><h2 class="cat-h2">Radius</h2><div class="cat-boxes">';
    Object.keys(M.tokens.radius).forEach(function (k) { var t = M.tokens.radius[k]; h += '<div class="cat-box" style="border-radius:' + (k === 'pill' ? '48px' : t.value) + '">' + k + ' · ' + t.value + '<br>' + esc(t.use || '') + '</div>'; });
    h += '</div><h2 class="cat-h2">Shadow</h2><div class="cat-boxes">';
    Object.keys(M.tokens.shadow).forEach(function (k) {
      var t = M.tokens.shadow[k], isF = /^drop-shadow/.test(t.value);
      h += '<div class="cat-box" style="border-radius:12px;border-color:transparent;' + (isF ? 'filter:' : 'box-shadow:') + esc(t.value) + '">' + k + '<br>' + esc(t.use || '') + '</div>';
    });
    h += '</div><h2 class="cat-h2">Layout</h2><div class="cat-card"><table class="cat-table"><tbody>';
    Object.keys(M.tokens.layout).forEach(function (k) { var t = M.tokens.layout[k]; h += '<tr><th style="width:220px">' + k + '</th><td><code>' + esc(t.value) + '</code></td><td>' + esc(t.use || '') + '</td></tr>'; });
    Object.keys(M.tokens.space).forEach(function (k) { var t = M.tokens.space[k]; h += '<tr><th>space-' + k + '</th><td><code>' + esc(t.value) + '</code></td><td>' + esc(t.use || '') + '</td></tr>'; });
    return h + '</tbody></table></div></div>';
  };
  V.icons = function () {
    var h = '<div class="cat-wrap"><p class="cat-crumb">Foundations</p><h1 class="cat-h1">Icons</h1><p class="cat-lead">' + M.icons.length + ' Tabler icons exported from Figma, one file per size and colour variant (for example <code>hammer.svg</code> white and <code>hammer-blue.svg</code> for the active left-bar item). Click to copy the <code>&lt;img&gt;</code> tag. Never draw new icons; if a variant is missing, export it from the Figma icons frame.</p><div class="cat-icons">';
    M.icons.forEach(function (i) {
      var white = /white|light/.test(i) || /^(menu|home|grid-dots|route|report-analytics|hammer|user|hierarchy|database)\.svg$/.test(i);
      h += '<button class="cat-icon" type="button" data-copy=\'<img src="assets/icons/' + i + '" width="16" height="16" alt="">\'><span class="cat-icon__img' + (white ? ' cat-icon__img--dark' : '') + '"><img src="kit/assets/icons/' + i + '" alt=""></span>' + i.replace('.svg', '') + '</button>';
    });
    return h + '</div></div>';
  };
  V.illustrations = function () {
    var h = '<div class="cat-wrap"><p class="cat-crumb">Foundations</p><h1 class="cat-h1">Illustrations &amp; shapes</h1><p class="cat-lead">Decorative SVGs used by cards, login and badges. Click to copy the path.</p><div class="cat-icons">';
    M.illustrations.forEach(function (i) {
      h += '<button class="cat-icon" type="button" data-copy="assets/' + i + '"><span class="cat-icon__img" style="height:80px"><img src="kit/assets/' + i + '" alt="" style="max-height:80px"></span>' + i + '</button>';
    });
    return h + '</div></div>';
  };

  V.components = function () {
    var h = '<div class="cat-wrap"><p class="cat-crumb">Components</p><h1 class="cat-h1">All components</h1><p class="cat-lead">Each one is cut verbatim from a legacy page, with that page\'s CSS. Copy the snippet into a page that loads the listed CSS files.</p>';
    groupBy(M.components, 'category').forEach(function (g) {
      h += '<h2 class="cat-h2">' + esc(g[0]) + '</h2><div class="cat-grid cat-grid--3">' + g[1].map(function (c) {
        return '<a class="cat-tile" href="#/components/' + c.id + '"><h3>' + esc(c.name) + '</h3><p>' + esc(c.description) + '</p><small>' + esc(c.css.join(' · ')) + '</small></a>';
      }).join('') + '</div>';
    });
    return h + '</div>';
  };
  V.component = function (id) {
    var c = M.components.filter(function (x) { return x.id === id; })[0];
    if (!c) return '<p class="cat-empty">Component not found.</p>';
    var w = c.width + 48, hgt = (c.height || 300) + 48;
    var links = c.css.map(function (f) { return '<link rel="stylesheet" href="' + f + '">'; }).join('\n') + (c.js.length ? '\n<!-- before </body> -->\n' + c.js.map(function (f) { return '<script src="' + f + '"></script>'; }).join('\n') : '');
    return '<div class="cat-wrap"><p class="cat-crumb">Components · ' + esc(c.category) + '</p><h1 class="cat-h1">' + esc(c.name) + '</h1><p class="cat-lead">' + esc(c.description) + '</p>' +
      '<div class="cat-chips"><span class="cat-chip"><b>id</b>' + c.id + '</span>' + chips('css', c.css) + chips('js', c.js) + '<span class="cat-chip"><b>from</b>' + esc(c.source) + '</span></div>' +
      preview(c.file, w, hgt, c.file + ' · ' + c.width + 'px design width', c.file) +
      codeBlock('HTML snippet', c.snippet) +
      codeBlock('Required in <head>', links) +
      '<h2 class="cat-h2">Ask your AI tool</h2><div class="cat-card"><p class="cat-prompt"><q>Add the TwinX “' + esc(c.name) + '” component (design-system/' + esc(c.file) + ') to my page and change the content to …</q></p></div></div>';
  };
  V.templates = function () {
    var h = '<div class="cat-wrap"><p class="cat-crumb">Page templates</p><h1 class="cat-h1">All page templates</h1><p class="cat-lead">Full pages from the legacy app. Copy <code>kit/&lt;page&gt;.html</code> to the project root (next to the runtime folders) and change only the content.</p>';
    groupBy(M.templates, 'group').forEach(function (g) {
      h += '<h2 class="cat-h2">' + esc(g[0]) + '</h2><div class="cat-grid cat-grid--3">' + g[1].map(function (t) {
        return '<a class="cat-tile" href="#/templates/' + t.id + '"><div class="cat-tile__thumb"><iframe src="' + t.file + '" loading="lazy" tabindex="-1" title=""></iframe></div><h3>' + esc(t.name) + '</h3><p>' + esc(t.purpose) + '</p><small>' + esc(t.file) + '</small></a>';
      }).join('') + '</div>';
    });
    return h + '</div>';
  };
  V.template = function (id) {
    var t = M.templates.filter(function (x) { return x.id === id; })[0];
    if (!t) return '<p class="cat-empty">Template not found.</p>';
    var secs = t.sections.map(function (s) { return '<tr><td>' + esc(s.label) + '</td><td><code>' + esc(s.element) + '</code></td></tr>'; }).join('');
    return '<div class="cat-wrap"><p class="cat-crumb">Page templates · ' + esc(t.group) + '</p><h1 class="cat-h1">' + esc(t.name) + '</h1><p class="cat-lead">' + esc(t.purpose) + '</p>' +
      '<div class="cat-chips"><span class="cat-chip"><b>file</b>' + esc(t.file) + '</span><span class="cat-chip"><b>page</b>.' + esc(t.pageClass.split(' ').join(' .')) + '</span>' + chips('css', t.css) + chips('js', t.js) + chips('dialog', t.dialogs.map(function (d) { return '#' + d; })) + '</div>' +
      preview(t.file, 1366, 800, t.file + ' · 1366 × 800 (scroll inside the frame)', t.file) +
      '<h2 class="cat-h2">Ask your AI tool</h2><div class="cat-card"><p class="cat-prompt"><q>Make the ' + esc(t.name.toLowerCase()) + ' page.</q> creates an exact copy.</p><p class="cat-prompt"><q>Make the ' + esc(t.name.toLowerCase()) + ' page for &lt;your feature&gt;: change the title to …, the table columns to …, and use these rows …</q> keeps the layout and swaps the content.</p></div>' +
      (secs ? '<h2 class="cat-h2">Regions in this page</h2><div class="cat-card"><table class="cat-table"><thead><tr><th>Region (comment in the HTML)</th><th>Element</th></tr></thead><tbody>' + secs + '</tbody></table></div>' : '') + '</div>';
  };

  function route() {
    var parts = (location.hash || '#/start').slice(2).split('/');
    var html;
    if (parts[0] === 'components' && parts[1]) html = V.component(parts[1]);
    else if (parts[0] === 'templates' && parts[1]) html = V.template(parts[1]);
    else if (parts[0] === 'foundations' && V[parts[1]]) html = V[parts[1]]();
    else if (V[parts[0]] && ['component', 'template'].indexOf(parts[0]) < 0) html = V[parts[0]]();
    else html = V.start();
    view.innerHTML = html;
    view.scrollTop = 0; window.scrollTo(0, 0);
    markCurrent();
    requestAnimationFrame(fit);
  }
  view.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (b) copy(b.getAttribute('data-copy'));
  });
  search.addEventListener('input', function () { buildNav(search.value); });
  window.addEventListener('hashchange', route);
  buildNav('');
  route();
})();
