/* FOR WEB
const urlsToCache = [
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/index.html",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/help.html",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/level.html",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/game.html",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/js/inputHandler.js",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/js/levels.js",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/js/loadGame.js",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/js/titlePage.js",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/css/game.css",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/css/main.css",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/background.jpeg",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/barrier_h.png",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/barrier_v.png",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/cactus.png",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/coin.png",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/flame.png",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/gate.png",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/player1.png",
    "https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/images/favicon-16x16.png",
];
*/


const CACHE_NAME = "my-game-cache-v1";
const urlsToCache = [
    "index.html",
    "help.html",
    "level.html",
    "game.html",
    "/js/inputHandler.js",
    "/js/levels.js",
    "/js/loadGame.js",
    "/js/titlePage.js",
    "/css/game.css",
    "/css/main.css",
    "/assets/images/background.jpeg",
    "/assets/images/barrier_h.png",
    "/assets/images/barrier_v.png",
    "/assets/images/cactus.png",
    "/assets/images/coin.png",
    "/assets/images/flame.png",
    "/assets/images/gate.png",
    "/assets/images/player1.png",
    "/assets/images/favicon-16x16.png",
];

self.addEventListener('install', e => {
    console.log("service worker: installed")
    e.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => {
                console.log("Service worker: Caching files");
                cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
})

self.addEventListener('activate', e => {
    console.log("service worker: activated")
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("Service worker: Clearing old cache");
                        return caches.delete(cache);
                    }
                })
            )
        })
    )
})

self.addEventListener('fetch', e => {
    console.log("Service Worker: Fetching");
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
})