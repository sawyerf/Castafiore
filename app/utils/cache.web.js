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
	]
	keys.forEach(async (key) => {
		await window.caches.delete(key)
	})
}

export const clearSongCache = async () => {
	await window.caches.delete('song')
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

export const getSongCachedInfo = async (config, songId, streamFormat, maxBitrate) => {
	const cache = await getCache('song', urlStream(config, songId, streamFormat, maxBitrate))
	if (!cache) return null
	return [
		{ title: 'Is cached', value: 'Yes' },
		{ title: 'Size', value: `${(cache.headers.get('content-length') / (1024 * 1024)).toFixed(2)} MB` },
	]
}

export const deleteSongCache = async (config, songId, streamFormat, maxBitrate) => {
	const urlStream = urlStream(config, songId, streamFormat, maxBitrate)

	await window.caches.open('song')
		.then(cache => cache.delete(urlStream))
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