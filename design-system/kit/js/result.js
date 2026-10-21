// Simulation Results: View/Edit Configuration and Submit for approval keep the chosen type and title in the URL.
document.querySelectorAll('[data-keep-query]').forEach(function (a) { a.href += location.search; });

// Result tabs: one part of the results at a time so the page fits the screen. #summary, #metrics, #drilldown or #articles opens that tab.
(function () {
  var panels = document.querySelector('.res-panels');
  var tabs = document.querySelectorAll('[data-res-tab]');
  if (!panels) return;
  function show(name) {
    panels.dataset.tab = name;
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.resTab === name)); });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.resTab); }); });
  var start = location.hash.slice(1);
  if (document.querySelector('[data-res-tab="' + start + '"]')) show(start);
})();
