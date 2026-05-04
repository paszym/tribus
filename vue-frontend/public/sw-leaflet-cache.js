const TILE_CACHE = 'osm-tiles'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.hostname.includes('osm.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached

        const response = await fetch(event.request, { mode: 'no-cors' })
        if (response.type === 'opaque') {
          cache.put(event.request, response.clone())
        }
        return response
      }),
    )
  }
})
