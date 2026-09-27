// Experiment page after Simulate (?simulate=1): the new promotion is listed first, its Experiment Status shows the
// analysis progress, and the Simulation Results page opens once it completes.
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
  row.classList.add('is-new');
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
      status.innerHTML = '<span class="badge badge--done"><span class="badge__text">Analysis completed</span></span>';
      if (window.PT) PT.toast('Analysis completed', 'Opening the simulation results…');
      setTimeout(function () { location.href = 'simulation-result.html' + query; }, 1100);
    }, 300);
  }
  requestAnimationFrame(step);
})();

// Row selection: the header box selects every row; Compare is enabled with two or three promotions ticked and opens
// the Experiment Compare page with them.
(function () {
  var compare = document.querySelector('[data-compare]');
  var all = document.querySelector('[data-select-all]');
  var chip = document.querySelector('[data-selection-count]');
  function boxes() { return Array.prototype.slice.call(document.querySelectorAll('.promos tbody .checkbox')); }
  function checkedRows() {
    return boxes().filter(function (b) { return b.checked; }).map(function (b) { return b.closest('tr'); });
  }
  function sync() {
    var n = checkedRows().length;
    var total = boxes().length;
    compare.disabled = n < 2 || n > 3;
    compare.setAttribute('data-tooltip', n > 3 ? 'Compare up to 3 promotions' : 'Select 2 or 3 promotions to compare');
    if (n >= 2 && n <= 3) compare.removeAttribute('data-tooltip');
    compare.textContent = n >= 2 && n <= 3 ? 'Compare ' + n : 'Compare';
    all.checked = n > 0 && n === total;
    all.indeterminate = n > 0 && n < total;
    chip.hidden = !n;
    chip.textContent = n + ' selected';
  }
  document.querySelector('.promos').addEventListener('change', function (e) {
    if (e.target === all) boxes().forEach(function (b) { b.checked = all.checked; });
    if (e.target.classList.contains('checkbox')) sync();
  });
  sync();

  compare.addEventListener('click', function () {
    var rows = checkedRows();
    if (rows.length < 2 || rows.length > 3) return;
    var query = rows.map(function (row) {
      var id = row.querySelector('.promos__id').textContent.trim();
      var iteration = row.querySelector('.badge--iteration .badge__text');
      var pick = [id, row.cells[1].textContent.trim(), iteration ? iteration.textContent.trim() : ''].join('|');
      return 'c=' + encodeURIComponent(pick);
    }).join('&');
    location.href = 'compare.html?' + query;
  });

  // Projects rail: one project is active at a time.
  document.querySelectorAll('.project').forEach(function (p) {
    p.addEventListener('click', function () {
      document.querySelectorAll('.project').forEach(function (o) {
        o.classList.toggle('project--active', o === p);
        o.setAttribute('aria-pressed', String(o === p));
      });
      var meta = document.querySelector('.optimization__meta');
      if (meta) meta.textContent = '600 promotions · ' + p.querySelector('.project__name').textContent;
    });
  });
})();
