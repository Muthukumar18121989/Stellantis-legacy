// Experiment Compare: the experiment page passes the ticked promotions as ?c=ID|Name|Iteration (two or three times).
// Their ID, name and iteration replace the Figma sample values; a third promotion adds a column to both tables,
// copied from the second one.
(function () {
  var picks = new URLSearchParams(location.search).getAll('c').map(function (value) {
    var parts = value.split('|');
    return { id: parts[0], name: parts[1] || '', iteration: parts[2] || '' };
  }).slice(0, 3);
  if (picks.length < 2) return;

  if (picks.length === 3) {
    document.querySelectorAll('.cmp-config tr, .cmp-metrics__head, .cmp-metrics__row').forEach(function (row) {
      row.querySelectorAll('[data-col="1"]').forEach(function (el) {
        var copy = el.cloneNode(true);
        copy.setAttribute('data-col', '2');
        row.appendChild(copy);
      });
    });
    var col = document.createElement('col');
    col.style.width = '351px';
    document.querySelector('.cmp-config colgroup').appendChild(col);
    document.querySelector('.cmp-config').classList.add('is-three');
    document.querySelector('.cmp-metrics').classList.add('is-three');
  }

  picks.forEach(function (pick, i) {
    var cells = document.querySelectorAll('.cmp-config__detail[data-col="' + i + '"]');
    cells.forEach(function (cell) {
      cell.querySelectorAll('[data-field]').forEach(function (el) {
        var value = pick[el.getAttribute('data-field')];
        if (value) el.textContent = value;
      });
    });
    document.querySelectorAll('.cmp-metrics__promo[data-col="' + i + '"]').forEach(function (el) {
      el.textContent = pick.id + ', ' + pick.name;
    });
  });
})();
