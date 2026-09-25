const CACHE_NAME = 'kuri-ledger-v2'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Network-first for navigations (so users get fresh HTML when online), falling
// back to whatever shell we've cached when offline. Cache-as-you-go for
// everything else (JS/CSS/images) so repeat visits and offline use work
// without needing to know Vite's hashed filenames ahead of time.
//
// Only same-origin requests are handled here — cross-origin calls (Supabase's
// REST/auth API, Google Fonts) are left completely alone. Supabase queries are
// GET requests too, and a cache-first strategy applied to them would silently
// serve stale data (e.g. a newly created Kuri not showing up) instead of ever
// hitting the network again once cached.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
    )
  )
})
