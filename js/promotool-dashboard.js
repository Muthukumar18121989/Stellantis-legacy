// Promotion dashboard: the Overview / Families & parts tabs switch their panels.
(function () {
  document.querySelectorAll('.pd-tab').forEach(function (tab, i, tabs) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });
})();
