/* Shared interface behaviour for every signed-in screen:
   - collapsible sidebar (remembered per browser)
   - dialogs animate out, close on Escape / backdrop click
   - table search boxes filter their table and show a "no results" state
   - toasts (PT.toast) and a connection banner when the browser goes offline */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sidebar ---------- */
  var root = document.documentElement;
  document.querySelectorAll('[data-sidebar-toggle]').forEach(function (btn) {
    function sync() {
      var collapsed = root.classList.contains('is-sidebar-collapsed');
      btn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      btn.setAttribute('aria-expanded', String(!collapsed));
    }
    sync();
    btn.addEventListener('click', function () {
      var collapsed = root.classList.toggle('is-sidebar-collapsed');
      try { localStorage.setItem('pt-sidebar', collapsed ? 'collapsed' : 'expanded'); } catch (e) { /* storage unavailable */ }
      sync();
    });
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
      var btn = document.querySelector('[data-sidebar-toggle]');
      if (btn) { e.preventDefault(); btn.click(); }
    }
  });

  /* ---------- Dialogs: exit animation ---------- */
  if (window.HTMLDialogElement && !HTMLDialogElement.prototype.__ptPatched) {
    var nativeClose = HTMLDialogElement.prototype.close;
    HTMLDialogElement.prototype.__ptPatched = true;
    HTMLDialogElement.prototype.close = function (value) {
      var dialog = this;
      if (!dialog.open) return;
      if (reduceMotion) { nativeClose.call(dialog, value); return; }
      if (dialog.classList.contains('is-closing')) return;
      dialog.classList.add('is-closing');
      var finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        dialog.classList.remove('is-closing');
        nativeClose.call(dialog, value);
      }
      dialog.addEventListener('animationend', function onEnd(e) {
        if (e.target !== dialog) return;
        dialog.removeEventListener('animationend', onEnd);
        finish();
      });
      setTimeout(finish, 280);
    };
  }
  document.addEventListener('cancel', function (e) {
    if (e.target instanceof HTMLDialogElement && !reduceMotion) { e.preventDefault(); e.target.close(); }
  }, true);
  document.addEventListener('click', function (e) {
    var d = e.target;
    if (!(d instanceof HTMLDialogElement) || !d.open) return;
    var r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });

  /* ---------- Toasts ---------- */
  var toaster;
  var ICON_OK = '<svg class="toast__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7.25" stroke="currentColor" stroke-width="1.3"/><path d="M5.8 9.2 8 11.3l4.2-4.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_INFO = '<svg class="toast__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7.25" stroke="currentColor" stroke-width="1.3"/><path d="M9 8.2v4M9 5.6v.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  function toast(title, text, opts) {
    opts = opts || {};
    if (!toaster) {
      toaster = document.createElement('div');
      toaster.className = 'toaster';
      toaster.setAttribute('role', 'status');
      toaster.setAttribute('aria-live', 'polite');
      document.body.appendChild(toaster);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (opts.icon === 'info' ? ICON_INFO : ICON_OK) + '<div><span class="toast__title"></span><span class="toast__text"></span></div>';
    el.querySelector('.toast__title').textContent = title;
    if (text) el.querySelector('.toast__text').textContent = text; else el.querySelector('.toast__text').remove();
    toaster.appendChild(el);
    setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, reduceMotion ? 0 : 240);
    }, opts.duration || 3800);
  }

  /* ---------- Busy state on a button ---------- */
  function busy(btn, on) {
    if (!btn) return;
    btn.classList.toggle('is-loading', on);
    btn.setAttribute('aria-busy', String(on));
  }

  /* ---------- Connection banner ---------- */
  var banner;
  function offline() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'net-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = 'You are offline <span>Changes will not be saved until the connection returns.</span>';
    document.body.appendChild(banner);
  }
  window.addEventListener('offline', offline);
  window.addEventListener('online', function () {
    if (!banner) return;
    banner.remove();
    banner = null;
    toast('Back online', 'Connection restored.', { icon: 'info', duration: 2600 });
  });
  if (navigator.onLine === false) offline();

  /* ---------- Table search ---------- */
  var SEARCH_ICON = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="m13.2 13.2 3.3 3.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  function bindSearch(input) {
    if (input.dataset.ptSearch) return;
    var scope = input.closest('.optimization, .es-card, .ad-card, .fam-dialog__main, .art-view, .rf-panel, .rp-card, section, main');
    var table = scope && scope.querySelector('table');
    if (!table || !table.tBodies.length) return;
    input.dataset.ptSearch = '1';
    var body = table.tBodies[0];
    var cols = (table.tHead && table.tHead.rows[0] ? Array.prototype.reduce.call(table.tHead.rows[0].cells, function (n, c) { return n + (c.colSpan || 1); }, 0) : 1);
    var empty = document.createElement('tr');
    empty.className = 'state-row';
    empty.hidden = true;
    empty.innerHTML = '<td class="state-cell" colspan="' + cols + '"><div class="state"><span class="state__icon">' + SEARCH_ICON + '</span>' +
      '<p class="state__title">No matching results</p><p class="state__text"></p>' +
      '<div class="state__actions"><button class="btn btn--sm" type="button">Clear search</button></div></div></td>';
    body.appendChild(empty);
    empty.querySelector('button').addEventListener('click', function () { input.value = ''; run(); input.focus(); });

    function run() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      Array.prototype.forEach.call(body.rows, function (row) {
        if (row === empty || row.classList.contains('vol-detail')) return;
        var match = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        row.toggleAttribute('data-filtered-out', !match);
        if (match && !row.hidden) shown++;
      });
      empty.hidden = !q || shown > 0;
      if (q) empty.querySelector('.state__text').textContent = 'Nothing matches “' + input.value.trim() + '”. Try an ID, a name or a status.';
    }
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape' && input.value) { e.stopPropagation(); input.value = ''; run(); } });
  }
  function bindAll(rootEl) {
    (rootEl || document).querySelectorAll('.search input[type=search], .ad-search input, .fam-search input[type=search], [data-table-search]').forEach(bindSearch);
  }
  bindAll();
  // Panels created later from <template> (article drill-down) get their search boxes bound on first focus.
  document.addEventListener('focusin', function (e) {
    if (e.target.matches && e.target.matches('.fam-search input[type=search], .search input[type=search], .ad-search input')) bindSearch(e.target);
  });

  var style = document.createElement('style');
  style.textContent = 'tr[data-filtered-out]{display:none}';
  document.head.appendChild(style);

  window.PT = { toast: toast, busy: busy };
})();
