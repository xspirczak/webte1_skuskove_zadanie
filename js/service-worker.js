const CACHE_NAME = "my-game-cache-v1";
const urlsToCache = [
    "/",
    "index.html",
    "help.html",
    "game.html",
    "level.html",
    "/assets/js/inputHandler.js",
    "/assets/js/levels.js",
    "/assets/js/loadGame.js",
    "/assets/js/titlePage.js",
    "/assets/css/game.css",
    "/assets/css/main.css",
    "/assets/images/background.jpeg",
    "/assets/images/background.jpeg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
