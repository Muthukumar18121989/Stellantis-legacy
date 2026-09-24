// Workflow Tracker: shows the promotion title carried over from the earlier pages, and opens the
// Validator Comments overlay from a lifecycle icon (closes on X or a click on the backdrop, as in the Figma prototype).
(function () {
  var title = new URLSearchParams(location.search).get('title');
  if (title) document.querySelector('[data-promo-name]').textContent = title;

  document.querySelectorAll('[data-open-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { document.getElementById(btn.dataset.openDialog).showModal(); });
  });
  document.querySelectorAll('dialog').forEach(function (dialog) {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      var r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  });
})();
