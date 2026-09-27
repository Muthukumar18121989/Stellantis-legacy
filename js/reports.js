// Reports: the tabs switch between the Promotions and Advanced analytics panels; Export report opens the export
// dialog, whose header checkbox ticks or clears every section. CSV exports the promotion tracking table, PDF opens
// the browser's print dialog. The market table sorts by any column header with a sort icon.
(function () {
  var tabs = document.querySelectorAll('.rp-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      fitChart();
    });
  });

  document.querySelectorAll('[data-open-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { document.getElementById(btn.dataset.openDialog).showModal(); });
  });
  var dialog = document.getElementById('report-download');
  dialog.querySelector('[data-close-dialog]').addEventListener('click', function () { dialog.close(); });

  // Section checkboxes
  var all = dialog.querySelector('.rp-dl thead .rp-checkbox');
  var items = dialog.querySelectorAll('.rp-dl tbody .rp-checkbox');
  var count = dialog.querySelector('[data-dl-count]');
  var exportButtons = dialog.querySelectorAll('[data-export]');
  function sync() {
    var n = Array.prototype.filter.call(items, function (b) { return b.checked; }).length;
    all.checked = n === items.length;
    all.indeterminate = n > 0 && n < items.length;
    count.textContent = n ? n + (n === 1 ? ' section' : ' sections') + ' selected' : 'Select at least one section';
    exportButtons.forEach(function (b) { b.disabled = !n; });
  }
  all.addEventListener('change', function () { items.forEach(function (box) { box.checked = all.checked; }); sync(); });
  items.forEach(function (box) { box.addEventListener('change', sync); });
  sync();

  // Export
  function csvCell(text) { return '"' + text.replace(/\s+/g, ' ').trim().replace(/"/g, '""') + '"'; }
  exportButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.PT) PT.busy(btn, true);
      setTimeout(function () {
        if (window.PT) PT.busy(btn, false);
        dialog.close();
        if (btn.dataset.export === 'CSV') {
          var table = document.querySelector('.rp-table');
          var rows = Array.prototype.map.call(table.rows, function (row) {
            return Array.prototype.slice.call(row.cells, 1).map(function (c) { return csvCell(c.textContent); }).join(',');
          });
          var blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'promotool-report.csv';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
          if (window.PT) PT.toast('Report exported', 'promotool-report.csv has been downloaded.');
        } else {
          setTimeout(function () { window.print(); }, 250);
        }
      }, 500);
    });
  });

  // Sortable market table
  document.querySelectorAll('.rp-aa-table').forEach(function (table) {
    var body = table.tBodies[0];
    Array.prototype.forEach.call(table.tHead.rows[0].cells, function (th, index) {
      if (!th.querySelector('img')) return;
      th.classList.add('is-sortable');
      th.setAttribute('aria-sort', 'none');
      th.tabIndex = 0;
      function sort() {
        var dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        Array.prototype.forEach.call(table.tHead.rows[0].cells, function (c) { if (c.classList.contains('is-sortable')) c.setAttribute('aria-sort', 'none'); });
        th.setAttribute('aria-sort', dir);
        var rows = Array.prototype.slice.call(body.rows);
        rows.sort(function (a, b) {
          var x = a.cells[index].textContent.trim(), y = b.cells[index].textContent.trim();
          var nx = parseFloat(x.replace(/[^\d.-]/g, '')), ny = parseFloat(y.replace(/[^\d.-]/g, ''));
          var cmp = !isNaN(nx) && !isNaN(ny) ? nx - ny : x.localeCompare(y);
          return dir === 'ascending' ? cmp : -cmp;
        });
        rows.forEach(function (r) { body.appendChild(r); });
      }
      th.addEventListener('click', sort);
      th.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
    });
  });

  // The elasticity chart is drawn at 1242px; scale it to the card width.
  var chart = document.querySelector('.rp-el');
  function fitChart() {
    if (!chart || !chart.offsetParent) return;
    var room = chart.parentNode.clientWidth - parseFloat(getComputedStyle(chart.parentNode).paddingLeft) * 2;
    var scale = Math.min(1.2, room / 1242);
    chart.style.zoom = scale;
  }
  window.addEventListener('resize', fitChart);
  fitChart();
})();
