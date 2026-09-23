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

  // "Upload" switches the dialog to its file-upload state; closing it returns to the family list.
  dialog.querySelector('[data-show-upload]').addEventListener('click', function () { dialog.dataset.state = 'upload'; });
  dialog.addEventListener('close', function () { delete dialog.dataset.state; });
  var file = dialog.querySelector('#fam-file');
  file.addEventListener('change', function () {
    if (file.files.length) dialog.querySelector('[data-file-name]').textContent = file.files[0].name;
  });
})();
