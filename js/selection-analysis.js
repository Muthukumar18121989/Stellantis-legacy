// Selection & Analysis step: Back keeps the chosen type and title; Manage Families opens the Select Family dialog.
(function () {
  document.querySelectorAll('[data-keep-query]').forEach(function (a) { a.href += location.search; });

  document.querySelectorAll('[data-open-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { document.getElementById(btn.dataset.openDialog).showModal(); });
  });
  document.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { btn.closest('dialog').close(); });
  });

  // Row checkboxes drive the "N Selected" button; the header checkbox selects or clears all rows.
  var dialog = document.getElementById('select-family');
  var all = dialog.querySelector('[data-check-all]');
  var rows = Array.prototype.slice.call(dialog.querySelectorAll('tbody .fam-check'));
  var count = dialog.querySelector('[data-selected-count]');
  function update() {
    var n = rows.filter(function (c) { return c.checked; }).length;
    count.textContent = n + ' Selected';
    all.checked = n === rows.length;
  }
  rows.forEach(function (c) { c.addEventListener('change', update); });
  all.addEventListener('change', function () {
    rows.forEach(function (c) { c.checked = all.checked; });
    update();
  });

  // "N Selected" closes the dialog and lists the chosen families on the page (Figma 26:9854).
  var list = document.querySelector('.fam-list');
  var template = document.getElementById('family-panel');
  dialog.querySelector('[data-apply-selection]').addEventListener('click', function () {
    var chosen = rows.filter(function (c) { return c.checked; });
    list.textContent = '';
    chosen.forEach(function (c) {
      var cells = c.closest('tr').cells;
      var panel = template.content.firstElementChild.cloneNode(true);
      var title = c.value + ' - ' + cells[1].textContent.trim();
      panel.querySelector('[data-family-title]').textContent = title;
      panel.querySelector('[data-toggle-family]').setAttribute('aria-label', title);
      panel.dataset.compClass = cells[5].textContent.trim();
      list.appendChild(panel);
    });
    list.hidden = !chosen.length;
    document.querySelector('[data-empty-state]').hidden = !!chosen.length;
    document.querySelector('.page--selection').classList.toggle('has-families', !!chosen.length);
    list.classList.remove('has-drilldown');
    document.querySelector('[data-page-next]').textContent = 'Next';
    document.querySelector('[data-selection-meta]').textContent = chosen.length
      ? chosen.length + (chosen.length === 1 ? ' Family' : ' Families') + ' | 296 Targeted SKUs'
      : '0 Families | 0 Targeted SKUs';
    dialog.close();
  });
  // "Drill Down to Article" replaces that family's panel with its article list (Figma 26:10344).
  var articles = document.getElementById('family-articles');
  // "Discount on MSRP at family level" promotions use their own Volume and Price Analysis tables (Figma 152:35568, 152:35837).
  // "Free quantity of another article" promotions do the same with Muthu's 2026-10-20 screenshots.
  var promoType = new URLSearchParams(location.search).get('type') || '';
  var variant = /MSRP at family level/i.test(promoType) ? 'msrp' : /Free quantity of another article/i.test(promoType) ? 'fq' : '';
  list.addEventListener('click', function (e) {
    var drill = e.target.closest('[data-drill-down]');
    if (!drill) return;
    var panel = drill.closest('.fam-panel');
    var view = articles.content.firstElementChild.cloneNode(true);
    var title = panel.querySelector('[data-family-title]').textContent;
    view.querySelector('[data-family-title]').textContent = title;
    view.setAttribute('aria-label', title + ' articles');
    if (variant) {
      ['volume', 'price'].forEach(function (tab) {
        var panel = document.getElementById('family-' + tab + '-' + variant).content.firstElementChild.cloneNode(true);
        view.querySelector('[data-tab-panel="' + tab + '"]').replaceWith(panel);
      });
      view.classList.add('art-view--' + variant);
      // Competitiveness class sits next to the family title instead of a table column.
      var comp = view.querySelector('[data-comp-class]');
      comp.textContent = 'Comp Class: ' + (panel.dataset.compClass || '').toUpperCase();
      comp.hidden = !panel.dataset.compClass;
    }
    panel.replaceWith(view);
    list.classList.add('has-drilldown');
    list.dataset.drillTab = 'exclusions';
    list.scrollTop = 0;
  });
  // Article checkboxes: the header checkbox selects or clears all rows.
  list.addEventListener('change', function (e) {
    var table = e.target.closest('.art-view table');
    if (!table || !e.target.classList.contains('fam-check') || e.target.closest('.pr-th-check, .pr-threshold')) return;
    var checks = Array.prototype.slice.call(table.querySelectorAll('tbody .fam-id .fam-check'));
    var head = table.querySelector('[data-check-all]');
    if (!head) return;
    if (e.target === head) checks.forEach(function (c) { c.checked = head.checked; });
    else head.checked = checks.every(function (c) { return c.checked; });
  });

  // Free quantity of another article: Buy and Free Quantity typed in either tab show in the other tab's row for that article.
  list.addEventListener('input', function (e) {
    var field = e.target.dataset.fq;
    var row = e.target.closest('tr[data-article]');
    if (!field || !row) return;
    e.target.closest('.art-view').querySelectorAll('tr[data-article="' + row.dataset.article + '"] [data-fq="' + field + '"]').forEach(function (input) {
      if (input !== e.target) input.value = e.target.value;
    });
  });

  // Free quantity of another article: the Free Article edit icon opens the Free Article Selector, and
  // "Select as Free Article" puts that Article ID in the row's Free Article cell (both tabs).
  var freeArticle = document.getElementById('free-article');
  var freeTarget = null;
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-open-free-article]');
    if (!btn) return;
    var row = btn.closest('tr[data-article]');
    freeTarget = { view: btn.closest('.art-view'), article: row.dataset.article };
    var name = row.querySelector('.msrp-name, .pr-name');
    freeArticle.querySelector('[data-free-article-for]').textContent = (name ? name.textContent.trim() + ' ' : '') + '(' + row.dataset.article + ')';
    freeArticle.showModal();
  });
  freeArticle.addEventListener('click', function (e) {
    var pick = e.target.closest('[data-select-free-article]');
    if (pick && freeTarget) {
      freeTarget.view.querySelectorAll('tr[data-article="' + freeTarget.article + '"] [data-open-free-article]').forEach(function (btn) {
        btn.querySelector('[data-fq-article-value]').textContent = pick.dataset.selectFreeArticle;
        btn.classList.add('is-set');
      });
      freeArticle.close();
      return;
    }
    var tab = e.target.closest('[data-fa-tab]');
    if (tab) freeArticle.querySelectorAll('[data-fa-tab]').forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
  });

  // Free Article Selector filters: the family dropdown can be typed in to search its list, and the
  // search box narrows the rows by Article ID or name.
  var famInput = freeArticle.querySelector('[data-fa-family]');
  var famList = freeArticle.querySelector('.fa-combo__list');
  var famOptions = Array.prototype.slice.call(famList.querySelectorAll('[role="option"]'));
  var famValue = famInput.value;
  var faSearch = freeArticle.querySelector('[data-fa-search]');
  var faRows = Array.prototype.slice.call(freeArticle.querySelectorAll('tbody tr[data-family]'));
  function filterFreeArticles() {
    var q = faSearch.value.trim().toLowerCase();
    var shown = 0;
    faRows.forEach(function (row) {
      var match = row.dataset.family === famValue && (!q || row.cells[0].textContent.toLowerCase().indexOf(q) > -1 || row.cells[1].textContent.toLowerCase().indexOf(q) > -1);
      row.hidden = !match;
      if (match) shown++;
    });
    freeArticle.querySelector('.fa-empty').hidden = shown > 0;
    freeArticle.querySelector('[data-fa-summary]').textContent = shown ? 'Showing article 1 to ' + shown + ' of ' + (q ? shown : 88) + ' entries' : 'Showing 0 entries';
  }
  function visibleOptions() { return famOptions.filter(function (o) { return !o.hidden; }); }
  function setActive(option) {
    famOptions.forEach(function (o) { o.classList.toggle('is-active', o === option); });
    if (option) { famInput.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' }); }
    else famInput.removeAttribute('aria-activedescendant');
  }
  function openFamilies(query) {
    var q = (query || '').trim().toLowerCase();
    famOptions.forEach(function (o) { o.hidden = !!q && o.textContent.toLowerCase().indexOf(q) === -1; });
    famList.hidden = false;
    famInput.setAttribute('aria-expanded', 'true');
    setActive(visibleOptions().filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })[0] || visibleOptions()[0]);
  }
  function closeFamilies() {
    famList.hidden = true;
    famInput.setAttribute('aria-expanded', 'false');
    setActive(null);
  }
  function chooseFamily(option) {
    famValue = option.textContent;
    famOptions.forEach(function (o) { o.setAttribute('aria-selected', String(o === option)); });
    famInput.value = famValue;
    closeFamilies();
    filterFreeArticles();
  }
  famInput.addEventListener('focus', function () { famInput.select(); openFamilies(); });
  famInput.addEventListener('click', function () { if (famList.hidden) openFamilies(); });
  famInput.addEventListener('input', function () { openFamilies(famInput.value); });
  famInput.addEventListener('blur', function () { closeFamilies(); famInput.value = famValue; });
  famInput.addEventListener('keydown', function (e) {
    var opts = visibleOptions();
    var i = opts.indexOf(famList.querySelector('.is-active'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (famList.hidden) openFamilies();
      else setActive(opts[e.key === 'ArrowDown' ? Math.min(i + 1, opts.length - 1) : Math.max(i - 1, 0)]);
      e.preventDefault();
    } else if (e.key === 'Enter' && !famList.hidden && opts[i]) {
      chooseFamily(opts[i]);
      e.preventDefault();
    } else if (e.key === 'Escape' && !famList.hidden) {
      closeFamilies();
      famInput.value = famValue;
      e.preventDefault(); // keep the dialog open
    }
  });
  famList.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus in the input
  famList.addEventListener('click', function (e) {
    var option = e.target.closest('[role="option"]');
    if (option) chooseFamily(option);
  });
  faSearch.addEventListener('input', filterFreeArticles);
  freeArticle.addEventListener('close', function () { faSearch.value = ''; filterFreeArticles(); });

  // Article view tabs: Exclusions, Volume Analysis (Figma 26:11097) and Price Analysis (Figma 26:11622).
  list.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab-target]');
    if (!tab) return;
    var view = tab.closest('.art-view');
    view.dataset.tab = tab.dataset.tabTarget;
    view.querySelectorAll('.art-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
    list.dataset.drillTab = view.dataset.tab;
    // Figma 26:11622: on Price Analysis the page's Next button reads "Simulate".
    document.querySelector('[data-page-next]').textContent = view.dataset.tab === 'price' ? 'Simulate' : 'Next';
  });
  // Price Analysis, Threshold Quantity: the header checkbox ticks every row, and Validate
  // copies the header quantity into the ticked rows (row inputs can also be edited directly).
  list.addEventListener('change', function (e) {
    if (!e.target.matches('[data-threshold-all]')) return;
    e.target.closest('table').querySelectorAll('.pr-th-check .fam-check').forEach(function (c) { c.checked = e.target.checked; });
  });
  list.addEventListener('click', function (e) {
    var validate = e.target.closest('[data-threshold-validate]');
    if (!validate) return;
    var table = validate.closest('table');
    var value = table.querySelector('[data-threshold-bulk]').value.trim();
    table.querySelectorAll('.pr-row').forEach(function (row) {
      if (row.querySelector('.pr-th-check .fam-check').checked) row.querySelector('.pr-th-value .vol-input').value = value;
    });
  });
  // Volume Analysis: each article row expands and collapses its Monthly Trend Analysis.
  list.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-toggle-article]');
    if (!toggle) return;
    var row = toggle.closest('tr');
    var detail = row.nextElementSibling;
    if (!detail || !detail.classList.contains('vol-detail')) {
      detail = articles.content.querySelector('.vol-detail').cloneNode(true);
      detail.hidden = true;
      detail.firstElementChild.colSpan = row.cells.length;
      setTrendView(detail.querySelector('.trend'), 'tiles');
      row.after(detail);
    }
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    detail.hidden = expanded;
  });

  // Monthly Trend Analysis switches between its Tiles and Graph views.
  function setTrendView(trend, view) {
    trend.dataset.view = view;
    trend.querySelectorAll('[data-trend-view]').forEach(function (btn) {
      btn.setAttribute('aria-selected', String(btn.dataset.trendView === view));
    });
  }
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-trend-view]');
    if (btn) setTrendView(btn.closest('.trend'), btn.dataset.trendView);
  });

  // Each family panel expands and collapses from its chevron.
  list.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-toggle-family]');
    if (!toggle) return;
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.closest('.fam-panel').classList.toggle('is-collapsed', expanded);
  });

  // "Upload" switches the dialog to its file-upload state; closing it returns to the family list.
  dialog.querySelector('[data-show-upload]').addEventListener('click', function () { dialog.dataset.state = 'upload'; });
  // "Validate" shows the validation result above the family table.
  var validate = dialog.querySelector('[data-validate]');
  var validateIcon = validate.querySelector('img');
  validate.addEventListener('click', function () {
    dialog.dataset.state = 'validated';
    validateIcon.src = 'assets/icons/refresh-dark.svg';
  });
  dialog.addEventListener('close', function () {
    delete dialog.dataset.state;
    validateIcon.src = 'assets/icons/refresh-white.svg';
  });
  // Simulate (Price Analysis tab) returns to the experiment page, which runs the analysis and then opens the results.
  document.querySelector('[data-page-next]').addEventListener('click', function () {
    if (this.textContent !== 'Simulate') return;
    var params = new URLSearchParams(location.search);
    params.set('families', list.children.length);
    params.set('simulate', '1');
    location.href = 'experiments.html?' + params.toString();
  });

  var file = dialog.querySelector('#fam-file');
  file.addEventListener('change', function () {
    if (file.files.length) dialog.querySelector('[data-file-name]').textContent = file.files[0].name;
  });
})();
