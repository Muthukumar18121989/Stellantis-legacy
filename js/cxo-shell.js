/* App shell behaviour for the CXO menu bar (layout/SidebarShell):
   - the collapse button switches 240px <-> 72px and the choice is kept per browser (localStorage "promotool-nav")
   - below 900px the menu bar is a drawer: the menu button opens it, the scrim, Escape or a nav click closes it
   Presentation only: navigation targets are the page's own links. */
(function () {
  var root = document.documentElement;
  var sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;
  var toggle = sidebar.querySelector('[data-nav-toggle]');
  var scrim = document.querySelector('[data-nav-close]');
  var openBtn = document.querySelector('[data-nav-open]');
  var phone = window.matchMedia('(max-width: 899px)');

  function setCollapsed(on) {
    root.classList.toggle('is-nav-collapsed', on);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!on));
      toggle.setAttribute('aria-label', on ? 'Expand menu' : 'Collapse menu');
      toggle.title = on ? 'Expand' : 'Collapse';
    }
    try { localStorage.setItem('promotool-nav', on ? 'collapsed' : 'expanded'); } catch (e) { /* private mode */ }
  }
  function setDrawer(open) {
    root.classList.toggle('is-nav-open', open);
    if (scrim) scrim.hidden = !open;
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
    if (open) { var first = sidebar.querySelector('.nav-item'); if (first) first.focus(); }
    else if (openBtn && phone.matches) openBtn.focus();
  }

  setCollapsed(root.classList.contains('is-nav-collapsed'));
  if (toggle) toggle.addEventListener('click', function () {
    if (phone.matches) { setDrawer(false); return; }
    setCollapsed(!root.classList.contains('is-nav-collapsed'));
  });
  if (openBtn) openBtn.addEventListener('click', function () { setDrawer(true); });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-nav-open')) setDrawer(false); });
  phone.addEventListener('change', function () { setDrawer(false); });
})();
