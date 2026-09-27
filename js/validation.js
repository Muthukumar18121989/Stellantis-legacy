// Logistics volume split: a family's chevron opens its article drilldown
// and the same chevron, now pointing up, returns to the family list.
(function () {
  var params = new URLSearchParams(location.search);
  document.querySelectorAll('[data-keep-query]').forEach(function (a) { a.href += location.search; });
  if (params.get('title')) document.querySelector('[data-promo-name]').textContent = params.get('title');

  // Submit for approval opens the Submit for approval dialog; its primary action continues to the
  // Workflow Tracker. The promotion name is the one on this page.
  var approval = document.getElementById('submit-approval');
  approval.querySelector('[data-approval-name]').value = document.querySelector('[data-promo-name]').textContent;
  document.querySelector('[data-initiate-approval]').addEventListener('click', function (e) { e.preventDefault(); approval.showModal(); });
  approval.querySelectorAll('[data-close-dialog]').forEach(function (b) { b.addEventListener('click', function () { approval.close(); }); });
  approval.addEventListener('click', function (e) { if (e.target === approval) { var r = approval.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) approval.close(); } });

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
