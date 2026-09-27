// Sign in: two demo users, checked in the browser (this app has no backend yet).
// Marcus Weber lands on the Experiments page; Kristen lands on the approval queue.
(function () {
  var USERS = {
    'marcus weber': { password: 'user123', home: 'experiments.html', name: 'Marcus' },
    'kristen': { password: 'admin123', home: 'experiment-status.html', name: 'Kristen' }
  };
  var form = document.getElementById('login-form');
  var user = document.getElementById('login-user');
  var password = document.getElementById('login-password');
  var eye = form.querySelector('.login__eye');
  var submit = form.querySelector('.login__submit');
  var alertBox = form.querySelector('[data-login-alert]');
  var alertText = form.querySelector('[data-login-alert-text]');

  eye.addEventListener('click', function () {
    var show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    password.focus();
  });

  function setError(input, message) {
    var error = document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message || '';
    error.hidden = !message;
  }
  function showAlert(message, tone) {
    alertBox.classList.toggle('alert--danger', tone !== 'info');
    alertText.textContent = message || '';
    alertBox.hidden = !message;
  }
  function shake() {
    form.classList.remove('is-shaking');
    void form.offsetWidth;
    form.classList.add('is-shaking');
  }
  [user, password].forEach(function (input) {
    input.addEventListener('input', function () { setError(input, ''); showAlert(''); });
  });

  // No reset or sign-up service exists yet: say who handles it instead of a dead link.
  form.querySelector('[data-forgot]').addEventListener('click', function (e) {
    e.preventDefault();
    showAlert('Password resets are handled by the Stellantis IT service desk.', 'info');
  });
  form.querySelector('[data-request-access]').addEventListener('click', function (e) {
    e.preventDefault();
    showAlert('Ask your Promotool administrator to create an account for you.', 'info');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showAlert('');
    var name = user.value.trim().replace(/\s+/g, ' ').toLowerCase();
    var missing = false;
    if (!name) { setError(user, 'Enter your user name.'); missing = true; }
    if (!password.value) { setError(password, 'Enter your password.'); missing = true; }
    if (missing) { shake(); (name ? password : user).focus(); return; }

    submit.classList.add('is-loading');
    submit.setAttribute('aria-busy', 'true');
    setTimeout(function () {
      var account = USERS[name];
      if (!account || password.value !== account.password) {
        submit.classList.remove('is-loading');
        submit.removeAttribute('aria-busy');
        if (!account) {
          showAlert('We couldn’t find an account with that user name.');
          user.setAttribute('aria-invalid', 'true');
          user.focus();
        } else {
          setError(password, 'Incorrect password. Check it and try again.');
          password.select();
        }
        shake();
        return;
      }
      form.innerHTML = '<div class="login__done" role="status"><svg class="success-mark" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M16.5 26.5 23 33l12.5-13.5"/></svg>' +
        '<div><p>Welcome back, ' + account.name + '</p><span>Opening your workspace…</span></div></div>';
      setTimeout(function () { window.location.href = account.home; }, 900);
    }, 650);
  });
})();
