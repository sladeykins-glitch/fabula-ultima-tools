self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys
      .filter(key => key.startsWith('fabula-ultima-tools-'))
      .map(key => caches.delete(key)))

    await self.registration.unregister()
    await self.clients.claim()

    const clients = await self.clients.matchAll({ type: 'window' })
    for (const client of clients) {
      client.navigate(client.url)
    }
  })())
})

self.addEventListener('fetch', () => {
  // Intentionally do not intercept requests. This worker only exists to
  // retire older cached versions of the app and then unregister itself.
})
