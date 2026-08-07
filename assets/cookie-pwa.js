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

  /**
   * Яндекс.Метрика грузится всегда (статистика посещаемости).
   * Баннер — уведомление об обработке; кнопка только скрывает его.
   */
  function loadMetrika() {
    var id = window.__KRV_METRIKA_ID;
    if (!id || window.__krvMetrikaLoaded) return;
    window.__krvMetrikaLoaded = true;
    var src = 'https://mc.yandex.ru/metrika/tag.js?id=' + id;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', src, 'ym');
    try {
      ym(id, 'init', {
        ssr: true,
        webvisor: true,
        clickmap: true,
        accurateTrackBounce: true,
        trackLinks: true
      });
    } catch (e) {}
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      var sw = (typeof krvUrl === 'function') ? krvUrl('sw.js') : '/sw.js';
      navigator.serviceWorker.register(sw).catch(function () {});
    });
  }

  // Метрика и SW — сразу (РФ, учёт посещаемости)
  loadMetrika();
  registerSW();

  if (ok) {
    hide();
  } else {
    show();
  }
  if (btn) {
    btn.addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      hide();
    });
  }
})();
