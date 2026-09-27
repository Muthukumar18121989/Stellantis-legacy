// Experiment status: the Submitted for Approval / Approved / Rejected pills select one at a time.
// The table itself is static (Figma shows only the Submitted for Approval list).
(function () {
  var tabs = document.querySelectorAll('.es-status__tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
    });
  });
})();
