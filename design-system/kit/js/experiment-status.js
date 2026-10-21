// Experiment status (Promotion Approval Dashboard).
// - The Submitted for Approval / Approved / Rejected pills show the requests in that state.
// - The tick / cross in Actions Status opens Approve Request / Reject Request for the ticked rows (the row clicked is
//   always included). Submit moves those rows to Approved / Rejected; Cancel, X or Esc leaves them as they were.
(function () {
  var tabs = document.querySelectorAll('.es-status__tab');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.promos tbody tr'));
  var all = document.querySelector('[data-select-all]');
  var current = 'submitted';
  var pending = [];

  function boxOf(row) { return row.querySelector('.checkbox'); }
  function visibleRows() { return rows.filter(function (r) { return !r.hidden; }); }
  function syncAll() {
    var shown = visibleRows();
    all.checked = shown.length > 0 && shown.every(function (r) { return boxOf(r).checked; });
  }
  function show(status) {
    current = status;
    tabs.forEach(function (t) {
      var on = t.dataset.status === status;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    rows.forEach(function (r) { r.hidden = r.dataset.status !== status; boxOf(r).checked = false; });
    syncAll();
  }

  tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.status); }); });
  all.addEventListener('change', function () { visibleRows().forEach(function (r) { boxOf(r).checked = all.checked; }); });
  rows.forEach(function (r) { boxOf(r).addEventListener('change', syncAll); });

  document.querySelectorAll('[data-decision]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('tr');
      boxOf(row).checked = true;
      syncAll();
      pending = visibleRows().filter(function (r) { return boxOf(r).checked; });
      var dialog = document.getElementById('es-' + btn.dataset.decision);
      dialog.querySelector('textarea').value = '';
      dialog.showModal();
    });
  });

  document.querySelectorAll('.es-dialog').forEach(function (dialog) {
    dialog.querySelectorAll('[data-close-dialog]').forEach(function (b) { b.addEventListener('click', function () { dialog.close(); }); });
    dialog.addEventListener('close', function () {
      if (dialog.returnValue === 'submit') {
        var status = dialog.id === 'es-approve' ? 'approved' : 'rejected';
        pending.forEach(function (r) { r.dataset.status = status; });
        show(current);
      }
      dialog.returnValue = '';
      pending = [];
    });
  });

  show('submitted');
})();
