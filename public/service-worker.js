// Service worker do FinanceFlow — dois trabalhos:
// 1) cache básico do app shell (manifest/ícones) + página de fallback offline
// 2) exibir notificações (via registration.showNotification) e roteá-las ao clicar
//
// Não tenta cachear páginas autenticadas nem chunks do Next.js — cache
// agressivo de HTML dinâmico ou de assets com hash quebraria fácil a cada
// deploy. Só a shell estática (offline.html, manifest, ícones) é precache.

const CACHE_NAME = "financeflow-shell-v1";
const APP_SHELL = ["/offline.html", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((chave) => chave !== CACHE_NAME).map((chave) => caches.delete(chave))))
      .then(() => self.clients.claim())
  );
});

// Navegação (carregar uma página): tenta a rede; se falhar (offline), mostra offline.html.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match("/offline.html").then((resposta) => resposta || Response.error()))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
