// غيّر رقم النسخة عند كل تحديث للموقع عشان يتحدث عند الجهاز
const CACHE = 'idaqah-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  ...['arabic', 'latin'].flatMap(s => [400, 500, 700, 800].map(w => `./fonts/tajawal-${s}-${w}-normal.woff2`)),
  './fonts/aref-ruqaa-arabic-700-normal.woff2', './fonts/aref-ruqaa-latin-700-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // الصفحة: من الشبكة أولاً (عشان التحديثات)، وإذا ما فيه نت من الكاش
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put('./index.html', r.clone())); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })));
});
