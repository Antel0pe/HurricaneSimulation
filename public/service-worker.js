// public/service-worker.js

const CACHE_NAME = 'tile-cache-v1';
const TILE_URL_PATTERN = /^https:\/\/gibs-[a-z]\.earthdata\.nasa\.gov\/wmts\/epsg4326\/best\/.+\/default\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\//;
// const TILE_URL_PATTERN =/^ https: \/\/gibs-[a-z]\.earthdata\.nasa\.gov\/wmts\/epsg4326\/best\/.+\/default\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\/das/;

// Install Event: Activate immediately
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

// Activate Event: Take control immediately
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    self.clients.claim();
});

// Listen for messages to preload tiles
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRELOAD_TILES') {
        const tileUrls = event.data.tileUrls;
        console.log('Service Worker received PRELOAD_TILES message:', tileUrls.length, 'tiles');
        if (Array.isArray(tileUrls)) {
            caches.open(CACHE_NAME).then((cache) => {
                // cache.addAll(tileUrls).catch((error) => {
                //     console.error('Failed to preload tiles:', error);
                // });
                tileUrls.forEach(tileUrl => 
                    cache.add(tileUrl)
                        // .then(_ => console.log(`successful cache: ${tileUrl}`))
                        // .catch(_ => console.error(`can't load ${tileUrl} to cache`))
                );
            });
        }
    }
});

// Fetch Event: Intercept tile requests
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    console.log('fetch service worker')
    console.log(request.url)
    console.log(TILE_URL_PATTERN.test(request.url))
    if (TILE_URL_PATTERN.test(request.url)) {
        console.log(`Service Worker intercepting tile request: ${request.url}`);
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    console.log(`service worker: checking ${request.url}`)
                    if (cachedResponse) {
                        console.log(`serving from cache ${request.url}`)
                        // Serve from cache
                        return cachedResponse;
                    }
                    // Fetch from network and cache it
                    return fetch(request).then((networkResponse) => {
                        // Clone the response to cache it
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => {
                        // Optionally, return a fallback image if the network is unavailable
                        return caches.match('/fallback-tile.png');
                    });
                });
            })
        );
    }
});
