// Report Hub: Download opens the Customize Your Report overlay (closes on X or a click on the backdrop, as in the
// Figma prototype). The header checkbox ticks or clears every section.
(function () {
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

  var all = document.querySelector('.rp-dl thead .rp-checkbox');
  var items = document.querySelectorAll('.rp-dl tbody .rp-checkbox');
  all.addEventListener('change', function () { items.forEach(function (box) { box.checked = all.checked; }); });
  items.forEach(function (box) {
    box.addEventListener('change', function () {
      all.checked = Array.prototype.every.call(items, function (b) { return b.checked; });
    });
  });
})();
