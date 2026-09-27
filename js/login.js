// Sign in: two demo users, checked in the browser (this app has no backend yet).
// Marcus Weber lands on the Experiments page; Kristen lands on the experiment status page.
(function () {
  var USERS = {
    'marcus weber': { password: 'user123', home: 'experiments.html' },
    'kristen': { password: 'admin123', home: 'experiment-status.html' }
  };
  var form = document.getElementById('login-form');
  var user = document.getElementById('login-user');
  var password = document.getElementById('login-password');
  var eye = document.querySelector('.login__eye');

  eye.addEventListener('click', function () {
    var show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', show ? 'true' : 'false');
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  [user, password].forEach(function (input) {
    input.addEventListener('input', function () { user.setCustomValidity(''); password.setCustomValidity(''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var account = USERS[user.value.trim().replace(/\s+/g, ' ').toLowerCase()];
    if (!account) { user.setCustomValidity('Unknown user name.'); user.reportValidity(); return; }
    if (password.value !== account.password) { password.setCustomValidity('Incorrect password.'); password.reportValidity(); return; }
    window.location.href = account.home;
  });
})();
