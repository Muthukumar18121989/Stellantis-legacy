// Workflow Tracker: shows the promotion title carried over from the earlier pages, and opens the
// Validator Comments overlay from a lifecycle icon (closes on X or a click on the backdrop, as in the Figma prototype).
(function () {
  var title = new URLSearchParams(location.search).get('title');
  if (title) document.querySelector('[data-promo-name]').textContent = title;

  document.querySelectorAll('[data-open-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { document.getElementById(btn.dataset.openDialog).showModal(); });
  });
  document.querySelectorAll('dialog').forEach(function (dialog) {
    dialog.querySelectorAll('[data-close-dialog]').forEach(function (b) { b.addEventListener('click', function () { dialog.close(); }); });
    dialog.addEventListener('click', function (e) {
      var r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  });

  // Volume Split Needed (opened by Modify Promotion): Final Allocation edits update the Total against the
  // 150 available, and Confirm Split needs a reason before it closes the dialog.
  var split = document.getElementById('volume-split');
  var reason = split.querySelector('[data-split-reason]');
  var total = split.querySelector('[data-allocation-total]');
  var available = +split.querySelector('[data-split-table]').getAttribute('data-available');
  var inputs = split.querySelectorAll('[data-allocation]');
  function updateTotal() {
    var sum = 0;
    inputs.forEach(function (i) { sum += parseInt(i.value, 10) || 0; });
    total.textContent = sum + ' / ' + available;
    total.className = 'vsn-total vsn-total--' + (sum === available ? 'ok' : sum > available ? 'over' : 'under');
  }
  inputs.forEach(function (i) { i.addEventListener('input', function () { i.value = i.value.replace(/\D/g, ''); updateTotal(); }); });
  updateTotal();
  reason.addEventListener('input', function () { reason.setCustomValidity(''); reason.classList.remove('is-invalid'); });
  split.querySelector('[data-confirm-split]').addEventListener('click', function () {
    reason.setCustomValidity(reason.value.trim() ? '' : 'Please enter a reason for the volume split.');
    if (!reason.reportValidity()) { reason.classList.add('is-invalid'); return; }
    split.close();
  });
})();
