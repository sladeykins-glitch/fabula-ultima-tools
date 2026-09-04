const CACHE = 'fabula-ultima-tools-v1'

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const scope = self.registration.scope
    const cache = await caches.open(CACHE)
    await cache.addAll([scope, `${scope}manifest.webmanifest`, `${scope}icon.svg`])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(request)
    const network = fetch(request).then(response => {
      if (response && response.ok) cache.put(request, response.clone())
      return response
    }).catch(() => null)

    if (request.mode === 'navigate') {
      const response = await network
      return response || cached || await cache.match(self.registration.scope)
    }

    return cached || await network || new Response('', { status: 504, statusText: 'Offline' })
  })())
})
