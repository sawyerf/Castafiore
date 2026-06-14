// Offline playlist caching relies on the device file system, which is not
// available on web (the web build uses a service worker instead). These are
// no-ops so the shared UI can import them unconditionally.

export const isPlaylistCached = () => false

export const addCachedPlaylist = async () => { }

export const removeCachedPlaylist = async () => { }

export const syncCachedPlaylists = async () => { }
