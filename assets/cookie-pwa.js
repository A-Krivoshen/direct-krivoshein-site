
(function () {
  'use strict';
  var KEY = 'krv-cookie-ok';
  var banner = document.getElementById('krv-cookie');
  var btn = document.getElementById('krv-cookie-ok');
  var ok = false;
  try { ok = localStorage.getItem(KEY) === '1'; } catch (e) {}
  function hide() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    banner.setAttribute('hidden', '');
  }
  function show() {
    if (!banner) return;
    banner.removeAttribute('hidden');
    banner.classList.add('is-visible');
  }
  if (ok) hide(); else show();
  if (btn) {
    btn.addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      hide();
    });
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();
