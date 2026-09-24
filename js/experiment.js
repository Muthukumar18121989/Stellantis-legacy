// Experiment page after Simulate (?simulate=1): the new promotion is listed first, its Experiment Status shows the
// analysis progress (Figma progress indicator, 26:14887), and the Simulation Results page opens once it completes.
(function () {
  var params = new URLSearchParams(location.search);
  if (!params.has('simulate')) return;

  var tbody = document.querySelector('.promos tbody');
  var row = tbody.rows[0].cloneNode(true);
  var id = '2725';
  var check = row.querySelector('.checkbox');
  check.checked = false;
  check.setAttribute('aria-label', 'Select ' + id);
  check.nextSibling.textContent = id;
  row.cells[1].textContent = params.get('title') || 'New Promotion';
  row.cells[3].textContent = '20/04/2026'; // execution window shown on the Simulation Results page
  row.cells[4].textContent = '29/04/2026';
  row.cells[5].textContent = params.get('families') || '1';
  var status = row.cells[6];
  status.innerHTML = '<span class="progress" role="progressbar" aria-label="Analysis progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
    '<span class="progress__track"><span class="progress__fill"></span></span><span class="progress__value">0%</span></span>';
  tbody.insertBefore(row, tbody.firstChild);
  tbody.deleteRow(tbody.rows.length - 1); // the table keeps its five rows

  // Coming back to this page later should not run the analysis again.
  params.delete('simulate');
  params.delete('families');
  var query = params.toString() ? '?' + params.toString() : '';
  history.replaceState(null, '', location.pathname + query);

  var bar = status.querySelector('.progress');
  var fill = status.querySelector('.progress__fill');
  var value = status.querySelector('.progress__value');
  var duration = 4000;
  var start = null;
  function step(now) {
    if (start === null) start = now;
    var pct = Math.min(100, Math.floor((now - start) / duration * 100));
    fill.style.width = pct + '%';
    value.textContent = pct + '%';
    bar.setAttribute('aria-valuenow', pct);
    if (pct < 100) { requestAnimationFrame(step); return; }
    setTimeout(function () {
      status.innerHTML = '<span class="badge badge--progress" style="width:135px"><img src="assets/shapes/dot-teal.svg" width="8" height="8" alt=""><span class="badge__text">Analysis Completed​</span></span>';
      setTimeout(function () { location.href = 'simulation-result.html' + query; }, 800);
    }, 300);
  }
  requestAnimationFrame(step);
})();
