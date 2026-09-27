/**
 * Service Worker para Notificaciones Push nativas estilo SofaScore
 * Manejo de alertas de GOL, actualizaciones de marcadores y clics en segundo plano
 */

const CACHE_NAME = 'ligamx-vivo-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache error (ignored for dev mode):', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Listener para notificaciones Push nativas del sistema operativo
self.addEventListener('push', (event) => {
  let data = {
    title: '¡GOOOOL EN LA LIGA MX!',
    body: 'Actualización de marcador en tiempo real',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'goal-alert',
    teamScorer: '',
    matchId: '',
    url: '/'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    image: data.image || undefined,
    // Patrón de vibración estilo alerta deportiva (fuerte - pausa - fuerte)
    vibrate: [300, 100, 300, 100, 400],
    tag: data.tag || `goal-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/',
      matchId: data.matchId,
      time: Date.now()
    },
    actions: [
      { action: 'open_match', title: 'Ver Partido' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Mensajes enviados desde la aplicación cliente para mostrar notificación local instantánea
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_GOAL_NOTIFICATION') {
    const { title, body, icon, badge, url, tag } = event.data.payload;
    const options = {
      body,
      icon: icon || '/icon.svg',
      badge: badge || '/icon.svg',
      vibrate: [300, 100, 300, 100, 400],
      tag: tag || `goal-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      data: { url: url || '/' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Manejo de clics en la notificación (lleva al usuario directamente a la app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
