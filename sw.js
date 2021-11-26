self.addEventListener('install', (event) => {
  event.waitUntil(async function() {

    caches.open('static-v0').then(function(cache) {
      return cache.addAll(['./',
    './index.html',
    './images/icons/icon-128x128.png',
    './images/icons/icon-192x192.png',
    './offline.html',
    './main.css',
    './app.js',
    './main.js',
    './images/no-image.jpg']);
    console.log('Service worker has been installed');
  }());
});


self.addEventListener('activate', async event => {
    const cachesKeys = await caches.keys();
    const checkKeys = cachesKeys.map(async key => {
        if (!['static-cache-v0', 'dynamic-cache-v0'].includes(key)) {
            await caches.delete(key);
        }
    });
    await Promise.all(checkKeys);
    console.log('Service worker has been activated');
});

self.addEventListener('fetch', event => {
    console.log(`Trying to fetch ${event.request.url}`);
    event.respondWith(checkCache(event.request));
});

async function checkCache(req) {
    const cachedResponse = await caches.match(req);
    return cachedResponse || checkOnline(req);
}

async function checkOnline(req) {
    const cache = await caches.open('dynamic-cache-v0');
    try {
        const res = await fetch(req);
        await cache.put(req, res.clone());
        return res;
    } catch (error) {
        const cachedRes = await cache.match(req);
        if (cachedRes) {
            return cachedRes;
        } else if (req.url.indexOf('.html') !== -1) {
            return caches.match('./offline.html');
        } else {
            return caches.match('./images/no-image.jpg');
        }
    }
}