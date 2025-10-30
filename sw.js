const CACHE_NAME = 'conheca-pe-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// Instalação
self.addEventListener('install', event => {
  console.log('🛠️ Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Adicionando arquivos ao cache...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos os recursos em cache');
        return self.skipWaiting();
      })
  );
});

// Ativação
self.addEventListener('activate', event => {
  console.log('🎯 Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // Não cachear API externa
  if (event.request.url.includes('nominatim.openstreetmap.org')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrou
        if (response) {
          return response;
        }

        // Faz requisição normal
        return fetch(event.request);
      })
  );
});