/* Admin pages: open and close the dialogs, show the chosen CSV name. */
(function () {
  document.querySelectorAll('[data-open-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.getElementById(btn.dataset.openDialog).showModal();
    });
  });
  document.querySelectorAll('dialog [data-close-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { btn.closest('dialog').close(); });
  });
  document.querySelectorAll('.bu-file').forEach(function (box) {
    var input = box.querySelector('input[type=file]');
    var name = box.querySelector('.bu-file__name');
    input.addEventListener('change', function () {
      if (input.files.length) name.textContent = input.files[0].name;
    });
  });
})();
