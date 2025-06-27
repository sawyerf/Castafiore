import { urlStream } from '~/utils/api'

export const getCache = async (cacheName, key) => {
	const caches = await window.caches.open(cacheName)
	if (!caches) return null
	return await caches.match(key)
}

export const clearCache = async () => {
	const keys = [
		'api',
		'coverArt',
		'images',
		'lyrics',
		'song',
	]
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

export const getJsonCache = async (cacheName, url) => {
	const cache = await getCache(cacheName, url)
	if (!cache) return null
	const json = await cache.json()
	if (!json) return null
	return json['subsonic-response']
}

export const setJsonCache = async (_cacheName, _key, _json) => {
	// Service worker already do this
}

export const isSongCached = async (config, songId, streamFormat, maxBitrate) => {
	return getCache('song', urlStream(config, songId, streamFormat, maxBitrate))
}

export const getListCacheSong = async () => {
	return []
}

export const getPathSong = (_songId, _streamFormat) => {
	return null
}

export const initCacheSong = async () => {
	if (global) global.listCacheSong = []
}