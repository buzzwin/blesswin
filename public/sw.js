// Service Worker for Push Notifications
const CACHE_NAME = 'blesswin-rituals-v1';
const urlsToCache = [
  '/',
  '/rituals',
  '/logo192.png',
  '/logo128.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Daily Ritual Reminder';
  const options = {
    body: data.body || 'Time to complete your daily ritual!',
    icon: '/logo192.png',
    badge: '/logo128.png',
    tag: data.tag || 'ritual-reminder',
    requireInteraction: data.requireInteraction || false,
    data: data.url || '/rituals'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data || '/rituals';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

