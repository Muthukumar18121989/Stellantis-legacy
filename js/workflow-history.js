/* Workflow History dialog: a row's history action opens it; X and OK close it.
   Its rows are the same sample history for every promotion. */
(function () {
  var dialog = document.getElementById('workflow-history');
  document.querySelectorAll('[data-workflow-history]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.stopPropagation(); dialog.showModal(); });
  });
  dialog.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { dialog.close(); });
  });
  dialog.querySelectorAll('.wh-link[href]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); }); // no target screen yet
  });
})();
