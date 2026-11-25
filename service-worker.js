/* Flip Watch service worker — installable + offline support.
 *
 * Strategy:
 *  - Precache the app shell so the first repeat visit works offline.
 *  - Navigations: network first, fall back to the cached page (or index.html).
 *  - Same-origin assets: cache first (ignoring the ?v= cache-busting query),
 *    refreshed in the background so updates still arrive.
 *  - Cross-origin requests (e.g. Unsplash) are left to the network.
 */
const CACHE = "flip-watch-v6";

const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Individually so one missing file cannot fail the whole install.
      await Promise.all(CORE.map((url) => cache.add(url).catch(() => {})));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

function store(request, response) {
  if (!response || !response.ok) return;
  caches.open(CACHE).then((cache) => cache.put(request, response)).catch(() => {});
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: fresh when online, cached when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          store(request, response.clone());
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request, { ignoreSearch: true })) ||
            (await caches.match("./index.html")) ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        })
    );
    return;
  }

  // Static assets: match the exact URL first, so a ?v= bump always wins. Only when
  // the network is unavailable do we fall back to a looser (query-insensitive) hit,
  // which is what makes the precached shell usable offline.
  //
  // Matching loosely *first* (the previous behaviour) meant a stale cached
  // script.js could be served to freshly deployed HTML, mixing old JS with new
  // markup and breaking the UI.
  event.respondWith(
    (async () => {
      const exact = await caches.match(request);
      if (exact) return exact;
      try {
        const response = await fetch(request);
        store(request, response.clone());
        return response;
      } catch (error) {
        const loose = await caches.match(request, { ignoreSearch: true });
        return (
          loose ||
          new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
        );
      }
    })()
  );
});

// The page asks a waiting worker to take over when the user taps "Reload".
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
