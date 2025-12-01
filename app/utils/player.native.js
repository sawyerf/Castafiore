/**
 * PLAYER ROUTER (React Native)
 *
 * This module dynamically routes player calls to either:
 * - Local player (playerLocal.native.js) - plays audio on the phone
 * - UPNP player (playerUpnp.native.js) - sends HTTP stream URL to external device
 *
 * The routing decision is made based on whether a UPNP device is selected.
 *
 * IMPORTANT: This is the main entry point for ALL player imports in React Native.
 * When you import '~/utils/player' in native code, Metro finds this file.
 */

import { State } from 'react-native-track-player'
import LocalPlayer from '~/utils/playerLocal'
import UpnpPlayer from '~/utils/playerUpnp'
import logger from '~/utils/logger'

// Global references
let upnpContext = null

/**
 * Initialize the player router with UPNP context and config
 * Must be called before any player operations
 */
export const initPlayerRouter = (context, _config) => {
	upnpContext = context
	UpnpPlayer.initUpnpPlayer(context)

	logger.info('PlayerRouter', 'Initialized with context', {
		hasContext: !!context,
		selectedDevice: context?.selectedDevice?.name
	})
}

/**
 * Check if UPNP device is selected
 */
const isUpnpActive = () => {
	return upnpContext?.selectedDevice != null
}

/**
 * Get the appropriate player (Local or UPNP)
 */
const getPlayer = () => {
	return isUpnpActive() ? UpnpPlayer : LocalPlayer
}

// ============================================================================
// ROUTED PLAYER FUNCTIONS
// ============================================================================

/**
 * Initialize the playback service (background player)
 * Routes to local player only (UPNP doesn't need background service)
 */
export const initService = async () => {
	logger.info('PlayerRouter', 'initService - always using local player')
	return LocalPlayer.initService()
}

/**
 * Initialize the track player
 * Initializes both local and UPNP players with songDispatch
 */
export const initPlayer = async (songDispatch) => {
	logger.info('PlayerRouter', 'initPlayer - initializing both players')
	// Initialize local player (sets up TrackPlayer)
	await LocalPlayer.initPlayer(songDispatch)
	// Initialize UPNP player (stores songDispatch for UI updates)
	await UpnpPlayer.initPlayer(songDispatch)
}

/**
 * Hook to handle player events
 * Routes to local player only (UPNP uses polling instead)
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
	const mode = isUpnpActive() ? 'UPNP' : 'LOCAL'
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
	// Call both hooks unconditionally (required by React hooks rules)
	const localTime = LocalPlayer.updateTime()
	const upnpTime = UpnpPlayer.updateTime()

	// Return the appropriate one based on mode
	return isUpnpActive() ? upnpTime : localTime
}

export const isVolumeSupported = () => {
	return isUpnpActive() ? UpnpPlayer.isVolumeSupported() : LocalPlayer.isVolumeSupported()
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
	State,
}
