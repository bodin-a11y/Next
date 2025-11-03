// public/sw.js

// Активируем новый SW сразу после установки
self.addEventListener('install', () => {
    self.skipWaiting();
  });
  
  // Берём управление открытыми вкладками
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });
  
  // Прозрачная прокси: ничего не кешируем (достаточно для installability)
  self.addEventListener('fetch', () => {
    // no-op — все запросы идут как обычно
  });