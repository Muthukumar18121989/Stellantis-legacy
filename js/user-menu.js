/* User menu, opened from the profile in the top bar, and the User Settings drawer opened from it.
   Both close on Escape or a click outside. Log out returns to the sign-in page. Values other than the
   name and role (read from the top bar) are sample data. */
(function () {
  var profile = document.querySelector('.topbar .profile, .profile');
  if (!profile) return;

  var name = (profile.querySelector('.profile__name') || {}).textContent || '';
  name = name.trim();
  var role = ((profile.querySelector('.profile__role') || {}).textContent || '').replace(/\(.*?\)/g, '').trim();
  var email = name.toUpperCase() === 'MARCUS WEBER' ? 'Marcusweber@gmail.com'
    : name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().replace(/\s+/g, '') + '@gmail.com';

  var initials = name.split(/\s+/).map(function (p) { return p.charAt(0); }).join('').slice(0, 2).toUpperCase();
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function field(label, value) {
    return '<label class="uf"><span class="uf__label">' + label + '</span><span class="uf__box"><input type="text" value="' + esc(value) + '" readonly></span></label>';
  }
  function input(label, placeholder, opts) {
    opts = opts || {};
    return '<label class="uf"><span class="uf__label">' + label + '</span><span class="uf__box' + (opts.grey ? ' uf__box--grey' : '') + '">' +
      '<input type="' + (opts.type || 'text') + '" placeholder="' + placeholder + '"' + (opts.noto ? ' class="is-noto"' : '') + (opts.disabled ? ' disabled' : '') + '>' +
      (opts.date ? '<img src="assets/icons/calendar-thin.svg" width="16" height="16" alt="">' : '') + '</span></label>';
  }
  function title(text, badge) {
    return '<div class="us-title"><h3>' + text + '</h3>' + (badge ? '<span class="us-badge">' + badge + '</span>' : '') + '</div>';
  }
  function delegation(n) {
    return '<div class="us-deleg">' +
      '<div class="us-deleg__head"><span class="us-deleg__title">Delegation ' + n + '</span></div>' +
      '<button class="us-deleg__remove" type="button" aria-label="Remove delegation"><img src="assets/icons/x.svg" width="24" height="24" alt=""></button>' +
      '<div class="us-row">' + input('Delegate user ID', 'USR-XXXXXX', { grey: true }) + input('Email address', 'email@company.com', { grey: true, noto: true }) + '</div>' +
      '<div class="us-row">' + input('Start date', 'mm/dd/yyyy', { date: true }) + input('End date', 'mm/dd/yyyy', { date: true, noto: true }) + '</div>' +
      '</div>';
  }
  function request(tid) {
    return '<div class="us-request">' +
      '<div class="us-request__who"><span class="us-avatar">PG</span>' +
      '<div class="us-request__info"><span class="us-person__name">Pierre Gasly</span><span class="us-badge us-badge--green">USR-pg100</span><span class="us-request__role">Junior Analyst</span></div>' +
      '<span class="us-badge us-badge--grey">' + tid + '</span></div>' +
      '<p class="us-request__period"><b>10 – 24 May</b></p>' +
      '<button type="button" aria-label="Decline"><img src="assets/icons/x-dark.svg" width="24" height="24" alt=""></button>' +
      '<button type="button" aria-label="Approve"><img src="assets/icons/check-dark-24.svg" width="24" height="24" alt=""></button>' +
      '</div>';
  }

  var html =
    '<dialog class="umn-dialog" id="user-menu" aria-label="User details">' +
      '<div class="umn-head"><span class="umn-avatar" aria-hidden="true">' + esc(initials) + '</span><div><h2 class="umn-head__name">' + esc(name) + '</h2><p class="umn-head__email">' + esc(email) + '</p></div></div>' +
      '<dl class="umn-details">' +
        '<div><dt>User ID</dt><dd>TID35672</dd></div>' +
        '<div><dt>Current role</dt><dd>' + esc(role || 'Promotion Pilot') + '</dd></div>' +
        '<div><dt>Market</dt><dd>Italy</dd></div>' +
        '<div><dt>Department</dt><dd>Marketing</dd></div>' +
      '</dl>' +
      '<div class="umn-actions">' +
        '<button class="umn-item" type="button" data-open-settings><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M8 1.8v1.6M8 12.6v1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M1.8 8h1.6M12.6 8h1.6M3.6 12.4l1.1-1.1M11.3 4.7l1.1-1.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>Settings &amp; delegations</button>' +
        '<button class="umn-item" type="button" data-log-out><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 13.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H6M10.5 11 13.5 8l-3-3M13.5 8H6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>Log out</button>' +
      '</div>' +
    '</dialog>' +
    '<dialog class="us-dialog" id="user-settings" aria-label="User Settings">' +
      '<button class="us-close" type="button" aria-label="Close" data-close-settings><img src="assets/icons/x.svg" width="24" height="24" alt=""></button>' +
      '<div class="us-head"><h2 class="us-head__title">Settings</h2><p class="us-head__sub">Manage your password and who can act on your behalf.</p></div>' +
      '<div class="us-body">' +
        '<section class="us-section us-security">' + title('Security and password') +
          '<div class="us-row">' + input('Current password', '*********', { grey: true, type: 'password', disabled: true }) + input('New password', 'At least 12 characters', { type: 'password', noto: true }) + '</div>' +
          '<div class="us-row">' + input('Confirm new password', 'Repeat the new password', { type: 'password' }) + '</div>' +
        '</section>' +
        '<section class="us-section">' + title('My delegations', '0 of 3 active') + delegation(1) + delegation(2) + delegation(3) + '</section>' +
        '<section class="us-section">' + title('Incoming delegation requests') +
          '<div class="us-batch"><div class="us-batch__info"><span class="us-badge">REQ-BATCH-001</span>Awaiting your approval</div>' +
            '<div class="us-batch__actions"><button class="ub ub--small" type="button">Decline all</button><button class="ub ub--small ub--primary" type="button">Approve batch</button></div></div>' +
          '<div class="us-requests">' +
            '<div class="us-col us-col--delegator"><span class="us-col__label">Requested by</span>' +
              '<div class="us-person"><div class="us-person__main"><span class="us-avatar">JV</span>' +
              '<div class="us-person__id"><span class="us-person__name">Juliette Verne</span><span class="us-badge us-badge--green">USR-jv882</span></div></div>' +
              '<p class="us-person__role">Market Analyst</p></div></div>' +
            '<div class="us-col us-col--requested"><span class="us-col__label">Requested delegates · max 3</span>' + request('TID5245') + request('TID6536') + request('TID6534') + '</div>' +
          '</div>' +
        '</section>' +
        '<section class="us-section">' + title('Delegations granted to me') +
          '<div class="us-granted"><div class="us-granted__who"><span class="us-avatar">AD</span>' +
            '<div class="us-granted__info"><div class="us-granted__top"><span class="us-person__name">Antone Dupont</span><span class="us-badge us-badge--green">TID2345</span></div>' +
            '<span class="us-granted__role">Regional Sales VP</span><span class="us-granted__dates">1 – 15 May 2026</span></div></div>' +
            '<span class="us-badge us-badge--green">Active</span></div>' +
        '</section>' +
      '</div>' +
      '<div class="us-actions"><button class="ub" type="button" data-close-settings>Cancel</button><button class="ub ub--primary" type="button" data-close-settings data-save-settings>Save changes</button></div>' +
    '</dialog>';

  document.body.insertAdjacentHTML('beforeend', html);
  var menu = document.getElementById('user-menu');
  var settings = document.getElementById('user-settings');

  // A click on the backdrop lands on the dialog element itself, outside its box
  [menu, settings].forEach(function (d) {
    d.addEventListener('click', function (e) {
      if (e.target !== d) return;
      var r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
  });
  profile.style.cursor = 'pointer';
  profile.addEventListener('click', function (e) { e.stopPropagation(); menu.showModal(); });
  menu.querySelector('[data-open-settings]').addEventListener('click', function () { menu.close(); settings.showModal(); settings.scrollTop = 0; });
  menu.querySelector('[data-log-out]').addEventListener('click', function () { location.href = 'index.html'; });
  settings.querySelectorAll('[data-close-settings]').forEach(function (b) {
    b.addEventListener('click', function () {
      settings.close();
      if (b.hasAttribute('data-save-settings') && window.PT) PT.toast('Settings saved', 'Your security and delegation settings are up to date.');
    });
  });
})();
