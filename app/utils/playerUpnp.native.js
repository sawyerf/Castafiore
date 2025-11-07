/**
 * UPNP/DLNA PLAYER MODULE (React Native)
 *
 * This module handles UPNP/DLNA audio playback to external devices.
 * It sends stream URLs to UPNP devices via SOAP commands.
 *
 * IMPORTANT:
 * - This module is for UPNP/DLNA streaming only
 * - For local playback, see playerLocal.native.js
 * - Always import from '~/utils/player' (router handles switching)
 *
 * Features:
 * - Device discovery (SSDP)
 * - Playback control via SOAP
 * - Queue management
 * - Playback state tracking
 */

import * as UPNP from '~/utils/upnp.native'
import { urlCover, urlStream } from '~/utils/api'
import { nextRandomIndex, prevRandomIndex } from '~/utils/tools'
import logger from '~/utils/logger'
import * as LocalPlayer from '~/utils/playerLocal.native'

// Import State from local player for compatibility
import { State } from 'react-native-track-player'

// Global references (set by router and initPlayer)
let upnpContext = null
let globalSongDispatch = null

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize UPNP player with context
 * Must be called before any player operations
 */
export const initUpnpPlayer = (context) => {
	upnpContext = context
	logger.info('UPNP-Player', 'Initialized with context')
}

/**
 * Initialize player (called by App to store songDispatch)
 */
export const initPlayer = async (songDispatch) => {
	globalSongDispatch = songDispatch
	logger.info('UPNP-Player', 'initPlayer called (UPNP mode - stored songDispatch)')
	songDispatch({ type: 'init' })
}

/**
 * Get currently selected UPNP device
 */
const getUpnpDevice = () => {
	return upnpContext?.selectedDevice
}

/**
 * Update UPNP status in context
 */
const updateStatus = (status) => {
	if (upnpContext?.updateStatus) {
		upnpContext.updateStatus(status)
	}
}

// ============================================================================
// PLAYBACK CONTROL
// ============================================================================

/**
 * Pause playback on UPNP device
 */
export const pauseSong = async () => {
	logger.info('UPNP-Player', 'Pausing on UPNP device')
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	const success = await UPNP.pauseOnDevice(device)
	if (success) {
		updateStatus({ state: 'paused' })
		// Update song context to reflect paused state
		if (globalSongDispatch) {
			globalSongDispatch({ type: 'setPlaying', state: State.Paused })
		}
	}
	return success
}

/**
 * Resume playback on UPNP device
 */
export const resumeSong = async () => {
	logger.info('UPNP-Player', 'Resuming on UPNP device')
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	// UPNP doesn't have a "resume" command, use Play with stored URL/metadata
	const currentUrl = upnpContext?.currentStatus?.currentUrl
	const currentMetadata = upnpContext?.currentStatus?.currentMetadata

	if (!currentUrl) {
		logger.warn('UPNP-Player', 'No URL stored for resume, cannot resume')
		return false
	}

	logger.info('UPNP-Player', 'Sending play command to UPNP device')
	const success = await UPNP.playOnDevice(device, currentUrl, currentMetadata)
	if (success) {
		updateStatus({ state: 'playing' })
		// Update song context to reflect playing state
		if (globalSongDispatch) {
			globalSongDispatch({ type: 'setPlaying', state: State.Playing })
		}
	}
	return success
}

/**
 * Stop playback on UPNP device
 */
export const stopSong = async () => {
	logger.info('UPNP-Player', 'Stopping on UPNP device')
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	const success = await UPNP.stopOnDevice(device)
	if (success) {
		updateStatus({ state: 'stopped' })
		// Update song context to reflect stopped state
		if (globalSongDispatch) {
			globalSongDispatch({ type: 'setPlaying', state: State.Stopped })
		}
	}
	return success
}

/**
 * Play song at specific index
 */
export const setIndex = async (config, songDispatch, queue, index) => {
	logger.info('UPNP-Player', 'Playing song on UPNP device', { index })

	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	const song = queue[index]
	if (!song) {
		logger.error('UPNP-Player', 'Song not found in queue at index', index)
		return false
	}

	if (!config) {
		logger.error('UPNP-Player', 'No config available for building stream URL')
		return false
	}

	// Build stream URL with proper parameters
	const streamUrl = urlStream(
		config,
		song.id,
		global.streamFormat || 'mp3',
		global.maxBitRate || 0
	)

	// Build metadata for UPNP device
	const metadata = {
		title: song.title,
		artist: song.artist,
		album: song.album,
		coverUrl: song.coverArt ? urlCover(config, song) : '',
	}

	logger.debug('UPNP-Player', 'Stream URL:', streamUrl)

	// Stop local player first to avoid playing on both phone and UPNP device
	await LocalPlayer.stopSong()

	const success = await UPNP.playOnDevice(device, streamUrl, metadata)

	if (success) {
		// Update song context
		songDispatch({ type: 'setIndex', index })
		// Update playing state
		songDispatch({ type: 'setPlaying', state: State.Playing })

		// Store current playback info for resume
		updateStatus({
			state: 'playing',
			currentUrl: streamUrl,
			currentMetadata: metadata,
		})
	}

	return success
}

/**
 * Play song - initializes queue and plays at index
 */
export const playSong = async (config, songDispatch, queue, index) => {
	logger.info('UPNP-Player', 'playSong called', {
		hasQueue: !!queue,
		queueLength: queue?.length,
		index
	})

	// Update queue first
	songDispatch({ type: 'setQueue', queue, index })

	// Play the song
	return setIndex(config, songDispatch, queue, index)
}

/**
 * Skip to next song in queue
 */
export const nextSong = async (config, song, songDispatch) => {
	if (!song.queue) {
		logger.warn('UPNP-Player', 'No queue available')
		return
	}

	let nextIndex
	if (song.actionEndOfSong === 'random') {
		nextIndex = nextRandomIndex()
	} else {
		nextIndex = (song.index + 1) % song.queue.length
	}

	await setIndex(config, songDispatch, song.queue, nextIndex)

	if (song.actionEndOfSong === 'repeat') {
		songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	}
}

/**
 * Skip to previous song in queue
 */
export const previousSong = async (config, song, songDispatch) => {
	if (!song.queue) {
		logger.warn('UPNP-Player', 'No queue available')
		return
	}

	let prevIndex
	if (song.actionEndOfSong === 'random') {
		prevIndex = prevRandomIndex()
	} else {
		prevIndex = (song.queue.length + song.index - 1) % song.queue.length
	}

	await setIndex(config, songDispatch, song.queue, prevIndex)

	if (song.actionEndOfSong === 'repeat') {
		songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	}
}

/**
 * Seek to position in current track
 */
export const setPosition = async (position) => {
	logger.info('UPNP-Player', 'Seeking on UPNP device', { position })
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	return UPNP.seekOnDevice(device, position)
}

/**
 * Set volume on UPNP device
 */
export const setVolume = async (volume) => {
	logger.info('UPNP-Player', 'Setting volume on UPNP device', { volume })
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	return UPNP.setVolumeOnDevice(device, volume * 100)
}

/**
 * Get volume from UPNP device
 */
export const getVolume = async () => {
	const device = getUpnpDevice()
	if (!device) {
		return 1.0
	}

	const volume = await UPNP.getVolumeFromDevice(device)
	return volume / 100
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert seconds to time string (MM:SS)
 */
export const secondToTime = (second) => {
	if (!second) return '00:00'
	if (second === Infinity) return '∞:∞'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

/**
 * Set repeat mode
 */
export const setRepeat = async (songDispatch, action) => {
	songDispatch({ type: 'setActionEndOfSong', action })
}

/**
 * Reset audio state
 */
export const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	stopSong()
}

/**
 * Remove song from queue
 */
export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

/**
 * Add song to queue
 */
export const addToQueue = async (config, songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

// ============================================================================
// STUBS FOR COMPATIBILITY
// ============================================================================

/**
 * UPNP doesn't support background service initialization
 */
export const initService = async () => {
	logger.info('UPNP-Player', 'initService called (UPNP mode - no background service)')
}

// initPlayer is defined at the top of the file to store globalSongDispatch

/**
 * UPNP doesn't support event hooks like TrackPlayer
 */
export const useEvent = (song, songDispatch) => {
	// No-op for UPNP
}

/**
 * UPNP devices don't need reload
 */
export const reload = async () => {
	logger.info('UPNP-Player', 'reload called (UPNP mode - restarting playback)')
	await resumeSong()
}

/**
 * UPNP doesn't need unload
 */
export const unloadSong = async () => {}

/**
 * Tuk tuk tuk Easter egg (not supported on UPNP)
 */
export const tuktuktuk = async (songDispatch) => {
	logger.info('UPNP-Player', 'tuktuktuk not supported on UPNP')
}

/**
 * Update volume (not needed for UPNP)
 */
export const updateVolume = () => {}

/**
 * Update time (UPNP uses polling instead)
 */
export const updateTime = () => {
	return { position: 0, duration: 0, buffered: 0 }
}

/**
 * UPNP supports volume control
 */
export const isVolumeSupported = () => {
	return true
}

// Re-export State for compatibility
export { State }

export default {
	initUpnpPlayer,
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
