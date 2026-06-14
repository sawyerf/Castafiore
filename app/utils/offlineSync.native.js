import { getApi } from '~/utils/api'
import { urlStream } from '~/utils/url'
import { downloadSong } from '~/utils/player'
import { deleteSongCache } from '~/utils/cache'
import logger from '~/utils/logger'

// Whether a playlist is marked to be kept offline.
export const isPlaylistCached = (settings, playlistId) => {
	return settings?.cachedPlaylists?.some((p) => p.id === playlistId) || false
}

// Fetch the up-to-date list of song ids of a playlist from the server.
const fetchPlaylistSongIds = async (config, playlistId) => {
	const json = await getApi(config, 'getPlaylist', { id: playlistId })
	return (json?.playlist?.entry || []).map((song) => song.id)
}

// Download every given song id that is not already on disk.
const downloadSongs = async (config, settings, songIds) => {
	for (const id of songIds) {
		await downloadSong(urlStream(config, id, settings.streamFormat, settings.maxBitRate), id)
	}
}

// Delete cached songs that are no longer needed by any kept playlist.
const deleteSongs = async (config, settings, songIds) => {
	for (const id of songIds) {
		await deleteSongCache(config, id, settings.streamFormat, settings.maxBitRate)
	}
}

// Union of song ids still needed by the cached playlists (optionally excluding one).
const songIdsInUse = (cachedPlaylists, exceptId) => {
	const inUse = new Set()
	for (const playlist of cachedPlaylists) {
		if (playlist.id === exceptId) continue
		for (const id of (playlist.songIds || [])) inUse.add(id)
	}
	return inUse
}

// Mark a playlist as kept offline and download all of its songs.
export const addCachedPlaylist = async (config, settings, setSettings, playlist) => {
	if (isPlaylistCached(settings, playlist.id)) return

	let songIds = (playlist.entry || []).map((song) => song.id)
	try {
		if (!songIds.length) songIds = await fetchPlaylistSongIds(config, playlist.id)
	} catch (error) {
		logger.error('addCachedPlaylist', error)
	}

	// Persist the mark first so the UI updates immediately and a download
	// interrupted mid-way is resumed on the next sync.
	const entry = { id: playlist.id, name: playlist.name, songIds }
	setSettings({ ...settings, cachedPlaylists: [...settings.cachedPlaylists, entry] })
	await downloadSongs(config, settings, songIds)
}

// Unmark a playlist and delete its songs that are not shared with other kept playlists.
export const removeCachedPlaylist = async (config, settings, setSettings, playlistId) => {
	const entry = settings.cachedPlaylists.find((p) => p.id === playlistId)
	if (!entry) return

	const remaining = settings.cachedPlaylists.filter((p) => p.id !== playlistId)
	setSettings({ ...settings, cachedPlaylists: remaining })

	const inUse = songIdsInUse(remaining)
	const toDelete = (entry.songIds || []).filter((id) => !inUse.has(id))
	await deleteSongs(config, settings, toDelete)
}

// Re-download missing songs and prune removed ones for every kept playlist.
// Called on app launch: if the server is unreachable each playlist is left untouched.
export const syncCachedPlaylists = async (config, settings, setSettings) => {
	if (!config?.url || !settings.cachedPlaylists?.length) return

	const updated = []
	let changed = false
	for (const playlist of settings.cachedPlaylists) {
		let songIds
		try {
			songIds = await fetchPlaylistSongIds(config, playlist.id)
		} catch {
			// Offline or fetch failed: keep the existing entry as-is.
			logger.info('syncCachedPlaylists', `Skip "${playlist.name}" (offline?)`)
			updated.push(playlist)
			continue
		}

		await downloadSongs(config, settings, songIds)

		const inUse = songIdsInUse(settings.cachedPlaylists, playlist.id)
		const removed = (playlist.songIds || []).filter((id) => !songIds.includes(id) && !inUse.has(id))
		if (removed.length) await deleteSongs(config, settings, removed)

		updated.push({ ...playlist, songIds })
		if (JSON.stringify(playlist.songIds) !== JSON.stringify(songIds)) changed = true
	}

	if (changed) setSettings({ ...settings, cachedPlaylists: updated })
}
