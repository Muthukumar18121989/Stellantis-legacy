// Workflow Tracker: shows the promotion title carried over from the earlier pages.
(function () {
  var title = new URLSearchParams(location.search).get('title');
  if (title) document.querySelector('[data-promo-name]').textContent = title;
})();
