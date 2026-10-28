// Guarda la app en el móvil para que abra al instante y se actualice en segundo plano.
// Al cambiar cualquier archivo de la app, sube VERSION para forzar la actualización.
const VERSION = 'hontza-ebf5e85c';
const ARCHIVOS = [
  './', './index.html', './config.js', './manifest.webmanifest',
  './icons/logo.png', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Solo archivos propios (nunca las llamadas a Google): responde con la copia guardada
// y, mientras, descarga la versión nueva para la próxima vez.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const red = fetch(e.request).then(r => {
      if (r.ok) cache.put(e.request, r.clone());
      return r;
    }).catch(() => guardado);
    return guardado || red;
  }));
});
