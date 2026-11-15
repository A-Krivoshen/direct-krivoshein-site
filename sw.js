/* Retired service worker for https://direct.krivoshein.site (krv-direct-retire-20261115).
   The landing no longer registers a worker. Browsers that still have the old one
   get this version: it drops every cache, unregisters itself and reloads open tabs,
   so visitors see the current page without a hard refresh. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (clients) { clients.forEach(function (c) { try { c.navigate(c.url); } catch (err) {} }); })
  );
});
