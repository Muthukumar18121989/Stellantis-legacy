// Approval queue.
// - The Awaiting approval / Approved / Rejected tabs show the requests in that state, with a count on each tab
//   and an empty state when a tab has none.
// - The tick / cross in a row opens Approve Request / Reject Request for the ticked rows (the row clicked is
//   always included). Submitting moves those rows to Approved / Rejected; Cancel, X or Esc leaves them as they were.
(function () {
  var tabs = document.querySelectorAll('.es-status__tab');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.promos tbody tr[data-status]'));
  var all = document.querySelector('[data-select-all]');
  var empty = document.querySelector('[data-status-empty]');
  var chip = document.querySelector('[data-selection-count]');
  var current = 'submitted';
  var pending = [];
  var EMPTY = {
    submitted: ['You’re all caught up', 'No promotions are waiting for your approval.'],
    approved: ['No approved requests yet', 'Requests you approve appear here.'],
    rejected: ['No rejected requests', 'Requests you reject are sent back to their pilot and listed here.']
  };

  function boxOf(row) { return row.querySelector('.checkbox'); }
  function visibleRows() { return rows.filter(function (r) { return !r.hidden; }); }
  function syncSelection() {
    var shown = visibleRows();
    var n = shown.filter(function (r) { return boxOf(r).checked; }).length;
    all.checked = shown.length > 0 && n === shown.length;
    all.indeterminate = n > 0 && n < shown.length;
    chip.hidden = !n;
    chip.textContent = n + ' selected';
  }
  function counts() {
    ['submitted', 'approved', 'rejected'].forEach(function (status) {
      var n = rows.filter(function (r) { return r.dataset.status === status; }).length;
      var el = document.querySelector('[data-count="' + status + '"]');
      if (el) el.textContent = n;
    });
  }
  function show(status) {
    current = status;
    tabs.forEach(function (t) {
      var on = t.dataset.status === status;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    rows.forEach(function (r) { r.hidden = r.dataset.status !== status; boxOf(r).checked = false; });
    var none = !visibleRows().length;
    empty.hidden = !none;
    if (none) {
      empty.querySelector('[data-empty-title]').textContent = EMPTY[status][0];
      empty.querySelector('[data-empty-text]').textContent = EMPTY[status][1];
    }
    all.disabled = none;
    counts();
    syncSelection();
  }

  tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.status); }); });
  all.addEventListener('change', function () { visibleRows().forEach(function (r) { boxOf(r).checked = all.checked; }); syncSelection(); });
  rows.forEach(function (r) { boxOf(r).addEventListener('change', syncSelection); });

  document.querySelectorAll('[data-decision]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('tr');
      boxOf(row).checked = true;
      syncSelection();
      pending = visibleRows().filter(function (r) { return boxOf(r).checked; });
      var dialog = document.getElementById('es-' + btn.dataset.decision);
      dialog.querySelector('textarea').value = '';
      dialog.querySelector('[data-decision-count]').textContent = pending.length > 1 ? pending.length + ' requests are included.' : '';
      dialog.showModal();
    });
  });

  document.querySelectorAll('.es-dialog').forEach(function (dialog) {
    dialog.querySelectorAll('[data-close-dialog]').forEach(function (b) { b.addEventListener('click', function () { dialog.close(); }); });
    dialog.addEventListener('close', function () {
      if (dialog.returnValue === 'submit') {
        var approved = dialog.id === 'es-approve';
        var n = pending.length;
        pending.forEach(function (r) { r.dataset.status = approved ? 'approved' : 'rejected'; });
        show(current);
        if (window.PT) {
          PT.toast(
            (n > 1 ? n + ' requests ' : 'Request ') + (approved ? 'approved' : 'rejected'),
            approved ? 'Moved to the next approval level.' : 'Returned to the promotion pilot with your comments.'
          );
        }
      }
      dialog.returnValue = '';
      pending = [];
    });
  });

  show('submitted');
})();
