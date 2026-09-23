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
    list.scrollTop = 0;
  });
  // Article checkboxes: the header checkbox selects or clears all rows.
  list.addEventListener('change', function (e) {
    var table = e.target.closest('.art-table');
    if (!table) return;
    var checks = Array.prototype.slice.call(table.querySelectorAll('tbody .fam-check'));
    var head = table.querySelector('[data-check-all]');
    if (e.target === head) checks.forEach(function (c) { c.checked = head.checked; });
    else head.checked = checks.every(function (c) { return c.checked; });
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
  var file = dialog.querySelector('#fam-file');
  file.addEventListener('change', function () {
    if (file.files.length) dialog.querySelector('[data-file-name]').textContent = file.files[0].name;
  });
})();
