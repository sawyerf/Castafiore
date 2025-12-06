/**
 * PLAYER ROUTER (React Native)
 *
 * This module dynamically routes player calls to either:
 * - Local player (playerLocal.native.js) - plays audio on the phone
 * - Remote players (playerUpnp.native.js, playerChromecast.native.js) - sends HTTP stream URL to external device
 *
 * The routing decision is made based on whether a remote device is selected.
 *
 * IMPORTANT: This is the main entry point for ALL player imports in React Native.
 * When you import '~/utils/player' in native code, Metro finds this file.
 */

import { State } from 'react-native-track-player'
import LocalPlayer from '~/utils/playerLocal'
import UpnpPlayer from '~/utils/playerUpnp'
import ChromecastPlayer from '~/utils/playerChromecast'
import logger from '~/utils/logger'

// Global references
let remoteContext = null

/**
 * Initialize the player router with remote context and config
 * Must be called before any player operations
 */
export const initPlayerRouter = (context, _config) => {
	remoteContext = context
	UpnpPlayer.initUpnpPlayer(context)
	ChromecastPlayer.initChromecastPlayer(context)

	logger.info('PlayerRouter', 'Initialized with context', {
		hasContext: !!context,
		selectedDevice: context?.selectedDevice?.name,
		deviceType: context?.selectedDevice?.type
	})
}

/**
 * Check if remote device is selected
 */
const isRemoteActive = () => {
	return remoteContext?.selectedDevice != null
}

/**
 * Get the appropriate player (Local, UPNP, or Chromecast)
 */
const getPlayer = () => {
	if (!isRemoteActive()) {
		return LocalPlayer
	}

	// Route to appropriate remote player based on device type
	const deviceType = remoteContext?.selectedDevice?.type
	switch (deviceType) {
		case 'chromecast':
			return ChromecastPlayer
		case 'upnp':
		default:
			return UpnpPlayer
	}
}

// ============================================================================
// ROUTED PLAYER FUNCTIONS
// ============================================================================

/**
 * Initialize the playback service (background player)
 * Routes to local player only (remote players don't need background service)
 */
export const initService = async () => {
	logger.info('PlayerRouter', 'initService - always using local player')
	return LocalPlayer.initService()
}

/**
 * Initialize the track player
 * Initializes local and all remote players with songDispatch
 */
export const initPlayer = async (songDispatch) => {
	logger.info('PlayerRouter', 'initPlayer - initializing all players')
	// Initialize local player (sets up TrackPlayer)
	await LocalPlayer.initPlayer(songDispatch)
	// Initialize remote players (stores songDispatch for UI updates)
	await UpnpPlayer.initPlayer(songDispatch)
	await ChromecastPlayer.initPlayer(songDispatch)
}

/**
 * Hook to handle player events
 * Routes to local player only (remote players use polling instead)
 */
export const useEvent = (song, songDispatch) => {
	return LocalPlayer.useEvent(song, songDispatch)
}

export const pauseSong = async () => {
	return getPlayer().pauseSong()
}

export const resumeSong = async () => {
	return getPlayer().resumeSong()
}

export const stopSong = async () => {
	return getPlayer().stopSong()
}

export const playSong = async (config, songDispatch, queue, index) => {
	const mode = isRemoteActive() ? 'REMOTE' : 'LOCAL'
	logger.info('PlayerRouter', `playSong - routing to ${mode}`, {
		hasQueue: !!queue,
		queueLength: queue?.length,
		index
	})
	return getPlayer().playSong(config, songDispatch, queue, index)
}

export const setIndex = async (config, songDispatch, queue, index) => {
	return getPlayer().setIndex(config, songDispatch, queue, index)
}

export const nextSong = async (config, song, songDispatch) => {
	return getPlayer().nextSong(config, song, songDispatch)
}

export const previousSong = async (config, song, songDispatch) => {
	return getPlayer().previousSong(config, song, songDispatch)
}

export const setPosition = async (position) => {
	return getPlayer().setPosition(position)
}

export const setVolume = async (volume) => {
	return getPlayer().setVolume(volume)
}

export const getVolume = () => {
	return getPlayer().getVolume()
}

export const reload = async () => {
	return getPlayer().reload()
}

export const setRepeat = async (songDispatch, action) => {
	return getPlayer().setRepeat(songDispatch, action)
}

export const resetAudio = (songDispatch) => {
	return getPlayer().resetAudio(songDispatch)
}

export const removeFromQueue = async (songDispatch, index) => {
	return getPlayer().removeFromQueue(songDispatch, index)
}

export const addToQueue = async (config, songDispatch, track, index = null) => {
	return getPlayer().addToQueue(config, songDispatch, track, index)
}

export const saveState = async () => {
	return getPlayer().saveState()
}

export const restoreState = async (state) => {
	return getPlayer().restoreState(state)
}

// ============================================================================
// HELPER FUNCTIONS (no routing needed, same for both)
// ============================================================================

export const secondToTime = LocalPlayer.secondToTime
export const unloadSong = LocalPlayer.unloadSong
export const tuktuktuk = LocalPlayer.tuktuktuk
export const updateVolume = LocalPlayer.updateVolume

/**
 * Update time hook - routes to correct player implementation
 * IMPORTANT: This must be a hook, not a regular function
 */
export const updateTime = () => {
	// Call all hooks unconditionally (required by React hooks rules)
	const localTime = LocalPlayer.updateTime()
	const upnpTime = UpnpPlayer.updateTime()
	const chromecastTime = ChromecastPlayer.updateTime()

	// Return the appropriate one based on mode and device type
	if (!isRemoteActive()) {
		return localTime
	}

	const deviceType = remoteContext?.selectedDevice?.type
	return deviceType === 'chromecast' ? chromecastTime : upnpTime
}

export const isVolumeSupported = () => {
	return isRemoteActive() ? UpnpPlayer.isVolumeSupported() : LocalPlayer.isVolumeSupported()
}

// Re-export State for compatibility
export { State }

export default {
	initPlayerRouter,
	initService,
	initPlayer,
	previousSong,
	nextSong,
	pauseSong,
	resumeSong,
	stopSong,
	playSong,
	secondToTime,
	setPosition,
	setVolume,
	getVolume,
	setRepeat,
	unloadSong,
	tuktuktuk,
	updateVolume,
	updateTime,
	isVolumeSupported,
	reload,
	useEvent,
	resetAudio,
	removeFromQueue,
	addToQueue,
	setIndex,
	saveState,
	restoreState,
	State,
}
