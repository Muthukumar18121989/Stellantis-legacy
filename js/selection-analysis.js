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
  list.addEventListener('click', function (e) {
    var drill = e.target.closest('[data-drill-down]');
    if (!drill) return;
    var panel = drill.closest('.fam-panel');
    var view = articles.content.firstElementChild.cloneNode(true);
    var title = panel.querySelector('[data-family-title]').textContent;
    view.querySelector('[data-family-title]').textContent = title;
    view.setAttribute('aria-label', title + ' articles');
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

  // Article view tabs: Exclusions and Volume Analysis (Figma 26:11097); Price Analysis has no design yet.
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
      detail = row.parentNode.querySelector('.vol-detail').cloneNode(true);
      detail.hidden = true;
      row.after(detail);
    }
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    detail.hidden = expanded;
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
    location.href = 'index.html?' + params.toString();
  });

  var file = dialog.querySelector('#fam-file');
  file.addEventListener('change', function () {
    if (file.files.length) dialog.querySelector('[data-file-name]').textContent = file.files[0].name;
  });
})();
