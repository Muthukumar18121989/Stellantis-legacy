// Promotion Validation / Logistics Volume Split: a family's chevron opens its article drilldown (Figma 55:44872)
// and the same chevron, now pointing up, returns to the family list (Figma 55:40381).
(function () {
  var params = new URLSearchParams(location.search);
  document.querySelectorAll('[data-keep-query]').forEach(function (a) { a.href += location.search; });
  if (params.get('title')) document.querySelector('[data-promo-name]').textContent = params.get('title');

  // Initiate Approval opens Submit Promotion for Approval (Figma 128:57162); Proceed to Approval continues to the
  // Workflow Tracker. The promotion name is the one on this page (Figma sample: Summer Beverage Promotion 2026).
  var approval = document.getElementById('submit-approval');
  approval.querySelector('[data-approval-name]').value = document.querySelector('[data-promo-name]').textContent;
  // Initiate Approval first asks for the family's Volume Split; Confirm Split (reason required) then opens
  // Submit Promotion for Approval. Final Allocation edits update the Total against the 150 available.
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
    approval.showModal();
  });
  document.querySelector('[data-initiate-approval]').addEventListener('click', function (e) { e.preventDefault(); split.showModal(); split.scrollTop = 0; });
  [split, approval].forEach(function (d) {
    d.querySelectorAll('[data-close-dialog]').forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
    d.addEventListener('click', function (e) { if (e.target === d) { var r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } });
  });

  var page = document.querySelector('.page--validation');
  var card = document.querySelector('[data-split]');
  var families = card.querySelector('[data-families]');
  var articles = card.querySelector('[data-articles]');

  card.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-toggle-family]');
    if (!btn) return;
    var open = btn.getAttribute('aria-expanded') !== 'true';
    var old = articles.querySelector('[data-family-row]');
    if (old) old.remove();
    if (open) {
      var row = btn.closest('tr').cloneNode(true);
      row.setAttribute('data-family-row', '');
      var toggle = row.querySelector('[data-toggle-family]');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', toggle.getAttribute('aria-label').replace('Show', 'Hide'));
      articles.insertBefore(row, articles.firstChild);
      toggle.focus();
    }
    families.hidden = open;
    articles.hidden = !open;
    card.classList.toggle('is-drilldown', open);
    page.classList.toggle('is-drilldown', open);
    if (!open) families.querySelector('[aria-label="' + btn.getAttribute('aria-label').replace('Hide', 'Show') + '"]').focus();
  });
})();
