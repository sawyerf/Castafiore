import { useSyncExternalStore } from 'react'

// Reactive store of the songs currently being downloaded to disk, with their
// download progress (0..100). `global.songsDownloading` only grows (it dedupes
// attempted ids), so it can't tell what is in flight right now — this tracks the
// live set and notifies React.

const progress = new Map()
const listeners = new Set()
let snapshot = []

const emit = () => {
	snapshot = Array.from(progress.keys())
	listeners.forEach((listener) => listener())
}

export const markDownloading = (id) => {
	if (progress.has(id)) return
	progress.set(id, 0)
	emit()
}

export const setProgress = (id, percent) => {
	if (!progress.has(id) || progress.get(id) === percent) return
	progress.set(id, percent)
	emit()
}

export const markDownloaded = (id) => {
	if (progress.delete(id)) emit()
}

const subscribe = (listener) => {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

// List of song ids currently downloading (reactive).
export const useDownloading = () => useSyncExternalStore(subscribe, () => snapshot, () => snapshot)

// Download progress of a song id (0..100), or null if it is not downloading (reactive).
export const useDownloadProgress = (id) => useSyncExternalStore(
	subscribe,
	() => (progress.has(id) ? progress.get(id) : null),
	() => (progress.has(id) ? progress.get(id) : null),
)
