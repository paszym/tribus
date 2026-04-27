// sw.js (osobny plik w public/)
const TILE_CACHE = 'osm-tiles-v1'

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Cachuj tylko kafelki OSM
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached

        const response = await fetch(event.request)
        // OSM wymaga zachowania nagłówków — sprawdź czy 200
        if (response.status === 200) {
          cache.put(event.request, response.clone())
        }
        return response
      }),
    )
  }
})
