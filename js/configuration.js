// Promotion Configuration: shows the type and title chosen in the New Promotion dialog.
(function () {
  var params = new URLSearchParams(location.search);
  var type = params.get('type');
  var title = params.get('title');
  if (type) document.getElementById('cfg-type').textContent = type;
  if (title) document.getElementById('cfg-name').value = title;
})();
