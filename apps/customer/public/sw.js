const CACHE_NAME = 'shaddai-buy-shell-v1';
const SHELL_ASSETS = ['/logo.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Network-first shell cache, same reasoning as the admin app's sw.js — this is a live checkout
// flow, never serve stale reads, the cache only exists for installability + an offline fallback.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Shaddai WiFi', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Shaddai WiFi', {
      body: payload.body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: payload.tag,
      data: payload.data,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.endsWith(url) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
