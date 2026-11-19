const CACHE_NAME = 'coach-desk-shell-v1';
const APP_URL = new URL('./', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('coach-desk-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(request, { cache: 'no-store' });
      if (fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, fresh.clone());
      }
      return fresh;
    } catch (error) {
      return (await caches.match(request)) || (await caches.match(APP_URL)) || Response.error();
    }
  })());
});