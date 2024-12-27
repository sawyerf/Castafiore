export const getCache = async (cacheName, key) => {
  const caches = await window.caches.open(cacheName)
  return await caches.match(key)
}

export const clearCache = async () => {
  const keys = await window.caches.keys()
  keys.forEach(async (key) => {
    await window.caches.delete(key)
  })
}

export const getStatCache = async () => {
  const caches = await window.caches.keys()
  const stats = []
  for (const name of caches) {
    const cache = await window.caches.open(name)
    const keys = await cache.keys()
    stats.push({ name, count: keys.length })
  }
  return stats.sort((a, b) => a.name.localeCompare(b.name))
}