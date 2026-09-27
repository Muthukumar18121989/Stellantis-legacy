/* Workflow History dialog (Figma 55:59243): the Action Status edit icon opens it; X and OK close it.
   Its rows are the static sample from Figma for every promotion. */
(function () {
  var dialog = document.getElementById('workflow-history');
  document.querySelectorAll('[data-workflow-history]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.stopPropagation(); dialog.showModal(); });
  });
  dialog.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { dialog.close(); });
  });
  dialog.querySelectorAll('.wh-link[href]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); }); // no target screen in Figma yet
  });
})();
