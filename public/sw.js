/*
 * Service worker do PWA — offline básico.
 * Navegações: network-first (sempre tenta a rede, guarda cópia).
 * Arquivos estáticos do Next: cache-first (já são imutáveis).
 */
const CACHE = "brasa-v1";
const CORE = ["/"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // nunca cachear APIs

  // Navegação: rede primeiro, offline cai para o cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const home = await caches.match("/");
          if (home) return home;
          return new Response(
            "<!doctype html><meta charset=utf-8><body style=\"background:#08080a;color:#fff;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0\"><div style=\"text-align:center\"><h1 style=\"font-size:20px\">Sem conexão</h1><p style=\"opacity:.6\">Verifique sua internet e tente de novo.</p></div>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }),
    );
    return;
  }

  // Estático: cache primeiro
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
            return response;
          }),
      ),
    );
  }
});
