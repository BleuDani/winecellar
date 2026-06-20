const CACHE_NAME = "wine-cellar-shell-v1";
const SHELL_URLS = ["/", "/manifest.webmanifest", "/icon", "/apple-icon"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
        return response;
      })
      .catch(
        () =>
          caches.match("/") ||
          new Response(
            "<html><body style='font-family: sans-serif; padding: 2rem; text-align: center;'><h1>You're offline</h1><p>Reconnect to load your wine cellar.</p></body></html>",
            { headers: { "Content-Type": "text/html" } }
          )
      )
  );
});
