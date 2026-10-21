/* User menu (Figma 128:56734) opened by the user name in the top bar, and the User Settings dialog
   (Figma 128:56753) opened by its Settings button. Both are Figma overlays with a 30% black backdrop
   that close on a click outside. Log Out returns to the login page. Values other than the name and
   role (read from the top bar) are Figma's sample data. */
(function () {
  var profile = document.querySelector('.top-menu .profile, .profile');
  if (!profile) return;

  var name = (profile.querySelector('.profile__name') || {}).textContent || '';
  name = name.trim();
  var role = ((profile.querySelector('.profile__role') || {}).textContent || '').replace(/\(.*?\)/g, '').trim();
  var email = name.toUpperCase() === 'MARCUS WEBER' ? 'Marcusweber@gmail.com'
    : name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().replace(/\s+/g, '') + '@gmail.com';

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
      '<div class="us-deleg__head"><span class="us-badge us-badge--dark">Delegation #' + n + '</span></div>' +
      '<button class="us-deleg__remove" type="button" aria-label="Remove delegation"><img src="assets/icons/x.svg" width="24" height="24" alt=""></button>' +
      '<div class="us-row">' + input('Delegate User ID', 'USR-XXXXXX', { grey: true }) + input('Email Address', 'email@company.com', { grey: true, noto: true }) + '</div>' +
      '<div class="us-row">' + input('Start Date', 'mm/dd/yyyy', { date: true }) + input('End Date', 'mm/dd/yyyy', { date: true, noto: true }) + '</div>' +
      '</div>';
  }
  function request(tid) {
    return '<div class="us-request">' +
      '<div class="us-request__who"><span class="us-avatar"><img src="assets/icons/letter-j.svg" width="24" height="24" alt=""></span>' +
      '<div class="us-request__info"><span class="us-person__name">Pierre Gasly</span><span class="us-badge us-badge--green">USR-pg100</span><span class="us-request__role">Junior Analyst</span></div>' +
      '<span class="us-badge us-badge--grey">' + tid + '</span></div>' +
      '<p class="us-request__period">Period: <b>May 10 - May 24</b></p>' +
      '<button type="button" aria-label="Decline"><img src="assets/icons/x-dark.svg" width="24" height="24" alt=""></button>' +
      '<button type="button" aria-label="Approve"><img src="assets/icons/check-dark-24.svg" width="24" height="24" alt=""></button>' +
      '</div>';
  }

  var html =
    '<dialog class="umn-dialog" id="user-menu" aria-label="User details">' +
      '<div class="umn-head"><h2 class="umn-head__name">' + esc(name) + '</h2><p class="umn-head__email">' + esc(email) + '</p></div>' +
      '<div class="umn-row">' + field('User Name', name) + field('User ID', 'TID35672') + '</div>' +
      '<div class="umn-row">' + field('Current Role', role || 'Promotion Pilot') + field('Market', 'Italy') + '</div>' +
      '<div class="umn-row">' + field('Department', 'Marketing') + '</div>' +
      '<div class="umn-actions"><button class="ub" type="button" data-open-settings>Settings</button><button class="ub ub--primary" type="button" data-log-out>Log Out</button></div>' +
    '</dialog>' +
    '<dialog class="us-dialog" id="user-settings" aria-label="User Settings">' +
      '<button class="us-close" type="button" aria-label="Close" data-close-settings><img src="assets/icons/x.svg" width="24" height="24" alt=""></button>' +
      '<div class="us-head"><h2 class="us-head__title">User Settings</h2><p class="us-head__sub">Manage your profile permission and security</p></div>' +
      '<div class="us-body">' +
        '<section class="us-section us-security">' + title('Security and Password') +
          '<div class="us-row">' + input('Current password', '*********', { grey: true, type: 'password', disabled: true }) + input('New Password', 'New Password', { type: 'password', noto: true }) + '</div>' +
          '<div class="us-row">' + input('Confirm New Password', 'Confirm Password', { type: 'password' }) + '</div>' +
        '</section>' +
        '<section class="us-section">' + title('My Delegations (Outgoing)', '0/3 Active') + delegation(1) + delegation(2) + delegation(3) + '</section>' +
        '<section class="us-section">' + title('Incoming Delegation Requests') +
          '<div class="us-batch"><div class="us-batch__info"><span class="us-badge">Batch ID: REQ-BATCH-001</span>Awaiting Approval</div>' +
            '<div class="us-batch__actions"><button class="ub ub--small" type="button">Decline All</button><button class="ub ub--small ub--primary" type="button">Approve Batch</button></div></div>' +
          '<div class="us-requests">' +
            '<div class="us-col us-col--delegator"><span class="us-col__label">Delegator (Requester)</span>' +
              '<div class="us-person"><div class="us-person__main"><span class="us-avatar"><img src="assets/icons/letter-j.svg" width="24" height="24" alt=""></span>' +
              '<div class="us-person__id"><span class="us-person__name">Juliette Verne</span><span class="us-badge us-badge--green">USR-jv882</span></div></div>' +
              '<p class="us-person__role">Market Analyst</p></div></div>' +
            '<div class="us-col us-col--requested"><span class="us-col__label">Requested Delegates (Max 3)</span>' + request('TID5245') + request('TID6536') + request('TID6534') + '</div>' +
          '</div>' +
        '</section>' +
        '<section class="us-section">' + title('Delegation Granted to me') +
          '<div class="us-granted"><div class="us-granted__who"><span class="us-avatar us-avatar--green"><img src="assets/icons/letter-a.svg" width="24" height="24" alt=""></span>' +
            '<div class="us-granted__info"><div class="us-granted__top"><span class="us-person__name">Antone Dupont</span><span class="us-badge us-badge--green"><span>TID2<br>345</span></span></div>' +
            '<span class="us-granted__role">Regional Sales VP</span><span class="us-granted__dates">From: 2026-05-01 To: 2026-05-15</span></div></div>' +
            '<span class="us-badge us-badge--green">ACTIVE</span></div>' +
        '</section>' +
      '</div>' +
      '<div class="us-actions"><button class="ub" type="button" data-close-settings>Cancel Changes</button><button class="ub ub--primary" type="button" data-close-settings>Save Configuration</button></div>' +
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
  settings.querySelectorAll('[data-close-settings]').forEach(function (b) { b.addEventListener('click', function () { settings.close(); }); });
})();
