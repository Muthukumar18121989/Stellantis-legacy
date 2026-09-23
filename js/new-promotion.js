// New Promotion dialog: opened by "Create New Promo", with the Promotion Type dropdown.
(function () {
  document.querySelectorAll('[data-open-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.getElementById(btn.dataset.openDialog).showModal();
    });
  });
  document.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { btn.closest('dialog').close(); });
  });

  document.querySelectorAll('[data-select]').forEach(function (select) {
    var trigger = select.querySelector('.select__trigger');
    var value = select.querySelector('.select__value');
    var list = select.querySelector('.select__list');
    var options = Array.prototype.slice.call(list.querySelectorAll('[role="option"]'));

    function current() {
      return options.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; });
    }
    function choose(i) {
      options.forEach(function (o, j) { o.setAttribute('aria-selected', String(i === j)); });
      value.textContent = options[i].textContent;
      list.setAttribute('aria-activedescendant', options[i].id);
    }
    function setOpen(open) {
      list.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) list.focus(); else if (select.contains(document.activeElement)) trigger.focus();
    }

    trigger.addEventListener('click', function () { setOpen(list.hidden); });
    options.forEach(function (o, i) {
      o.addEventListener('click', function () { choose(i); setOpen(false); });
    });
    list.addEventListener('keydown', function (e) {
      var i = current();
      if (e.key === 'ArrowDown') { choose(Math.min(i + 1, options.length - 1)); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { choose(Math.max(i - 1, 0)); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') { setOpen(false); if (e.key !== 'Tab') e.preventDefault(); }
      else if (e.key === 'Escape') { setOpen(false); e.preventDefault(); e.stopPropagation(); }
    });
    document.addEventListener('click', function (e) {
      if (!list.hidden && !select.contains(e.target)) setOpen(false);
    });
  });

  // Create Promotion opens the Promotion Configuration page with the chosen type and title.
  document.querySelectorAll('[data-create-promotion]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dialog = btn.closest('dialog');
      var params = new URLSearchParams();
      params.set('type', dialog.querySelector('.select__value').textContent);
      var title = dialog.querySelector('#promo-title').value.trim();
      if (title) params.set('title', title);
      location.href = 'promotion-configuration.html?' + params.toString();
    });
  });
})();
