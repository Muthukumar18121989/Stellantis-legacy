// Simulation Results: View/Edit Configuration keeps the chosen type and title in the URL.
document.querySelectorAll('[data-keep-query]').forEach(function (a) { a.href += location.search; });
