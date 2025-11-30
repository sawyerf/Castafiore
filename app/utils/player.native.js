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

import * as LocalPlayer from './playerLocal'
import * as UpnpPlayer from './playerUpnp'
import { State } from 'react-native-track-player'
import logger from './logger'

// Global references
let upnpContext = null

/**
 * Initialize the player router with UPNP context and config
 * Must be called before any player operations
 */
export const initPlayerRouter = (context, config) => {
	upnpContext = context

	// Initialize UPNP player with context
	UpnpPlayer.initUpnpPlayer(context)

	logger.info('PlayerRouter', 'Initialized with context', {
		hasContext: !!context,
		hasConfig: !!config,
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

/**
 * Pause song - routes to local or UPNP
 */
export const pauseSong = async () => {
	return getPlayer().pauseSong()
}

/**
 * Resume song - routes to local or UPNP
 */
export const resumeSong = async () => {
	return getPlayer().resumeSong()
}

/**
 * Stop song - routes to local or UPNP
 */
export const stopSong = async () => {
	return getPlayer().stopSong()
}

/**
 * Play song - routes to local or UPNP
 */
export const playSong = async (config, songDispatch, queue, index) => {
	const player = getPlayer()
	const mode = isUpnpActive() ? 'UPNP' : 'LOCAL'
	logger.info('PlayerRouter', `playSong - routing to ${mode}`, {
		hasQueue: !!queue,
		queueLength: queue?.length,
		index
	})
	return player.playSong(config, songDispatch, queue, index)
}

/**
 * Set index - routes to local or UPNP
 */
export const setIndex = async (config, songDispatch, queue, index) => {
	return getPlayer().setIndex(config, songDispatch, queue, index)
}

/**
 * Next song - routes to local or UPNP
 */
export const nextSong = async (config, song, songDispatch) => {
	return getPlayer().nextSong(config, song, songDispatch)
}

/**
 * Previous song - routes to local or UPNP
 */
export const previousSong = async (config, song, songDispatch) => {
	return getPlayer().previousSong(config, song, songDispatch)
}

/**
 * Set position - routes to local or UPNP
 */
export const setPosition = async (position) => {
	return getPlayer().setPosition(position)
}

/**
 * Set volume - routes to local or UPNP
 */
export const setVolume = async (volume) => {
	return getPlayer().setVolume(volume)
}

/**
 * Get volume - routes to local or UPNP
 */
export const getVolume = () => {
	return getPlayer().getVolume()
}

/**
 * Reload - routes to local or UPNP
 */
export const reload = async () => {
	return getPlayer().reload()
}

/**
 * Set repeat mode
 */
export const setRepeat = async (songDispatch, action) => {
	const player = getPlayer()
	return player.setRepeat(songDispatch, action)
}

/**
 * Reset audio
 */
export const resetAudio = (songDispatch) => {
	const player = getPlayer()
	return player.resetAudio(songDispatch)
}

/**
 * Remove from queue
 */
export const removeFromQueue = async (songDispatch, index) => {
	const player = getPlayer()
	return player.removeFromQueue(songDispatch, index)
}

/**
 * Add to queue
 */
export const addToQueue = async (config, songDispatch, track, index = null) => {
	const player = getPlayer()
	return player.addToQueue(config, songDispatch, track, index)
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
