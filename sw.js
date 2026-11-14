/* PWA service worker — https://direct.krivoshein.site */
var CACHE = 'krv-direct-cro-20261114';
var PRECACHE = [
  '/',
  '/privacy.html',
  '/site.webmanifest',
  '/llms.txt',
  '/ai.txt',
  '/assets/cookie-pwa.css',
  '/assets/cookie-pwa.js',
  '/assets/fonts/inter.css',
  '/assets/app.css',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(PRECACHE).catch(function () {});
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
      return caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.hostname.indexOf('yandex') !== -1 || url.hostname.indexOf('replain') !== -1) return;
  e.respondWith(caches.match(req).then(function (cached) {
    var net = fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () { return cached || caches.match('/'); });
    return cached || net;
  }));
});
