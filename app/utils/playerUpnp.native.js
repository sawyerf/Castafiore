/**
 * UPNP/DLNA Player Module
 * Handles audio playback to external UPNP/DLNA devices via SOAP commands.
 */

import React from 'react'
import * as UPNP from '~/utils/upnp.native'
import { urlCover, urlStream } from '~/utils/url'
import { nextRandomIndex, prevRandomIndex } from '~/utils/tools'
import logger from '~/utils/logger'
import * as LocalPlayer from '~/utils/playerLocal.native'
import { State } from 'react-native-track-player'

// Global state
let upnpContext = null
let globalSongDispatch = null
let statusPollingInterval = null
let currentPlaybackUrl = null
let currentPlaybackMetadata = null
let currentTime = 0
let currentDuration = 0
let isPolling = false
let currentPlayerState = 'stopped'

// Polling intervals
const POLL_INTERVAL_PLAYING = 1000  // 1s when playing
const POLL_INTERVAL_PAUSED = 3000   // 3s when paused

export const initUpnpPlayer = (context) => {
	upnpContext = context
}

export const initPlayer = async (songDispatch) => {
	globalSongDispatch = songDispatch
	songDispatch({ type: 'init' })
}

const getUpnpDevice = () => upnpContext?.selectedDevice

const updateStatus = (status) => {
	upnpContext?.updateStatus?.(status)
}

const startStatusPolling = (state = 'playing') => {
	stopStatusPolling()

	currentPlayerState = state
	const interval = state === 'playing' ? POLL_INTERVAL_PLAYING : POLL_INTERVAL_PAUSED

	const pollStatus = async () => {
		const device = getUpnpDevice()
		if (!device || !globalSongDispatch) {
			stopStatusPolling()
			return
		}

		// Skip if already polling (prevent concurrent requests)
		if (isPolling) {
			return
		}

		isPolling = true

		try {
			const status = await UPNP.getDeviceStatus(device)
			if (status) {
				currentTime = status.position
				currentDuration = status.duration

				globalSongDispatch({
					type: 'setTime',
					time: status.position,
					duration: status.duration
				})

				const stateMap = {
					'playing': State.Playing,
					'paused': State.Paused,
					'stopped': State.Stopped
				}

				if (stateMap[status.state]) {
					globalSongDispatch({
						type: 'setPlaying',
						state: stateMap[status.state]
					})

					// Adjust polling interval if state changed
					if (status.state !== currentPlayerState) {
						currentPlayerState = status.state

						// Restart polling with new interval if needed
						if (status.state === 'playing' || status.state === 'paused') {
							stopStatusPolling()
							startStatusPolling(status.state)
						} else if (status.state === 'stopped') {
							stopStatusPolling()
						}
					}
				}

				updateStatus(status)
			}
		} catch (error) {
			logger.error('UPNP-Player', 'Polling error:', error.message)
		} finally {
			isPolling = false
		}
	}

	// Initial poll
	pollStatus()

	// Set up interval
	statusPollingInterval = setInterval(pollStatus, interval)
}

const stopStatusPolling = () => {
	if (statusPollingInterval) {
		clearInterval(statusPollingInterval)
		statusPollingInterval = null
		logger.info('UPNP-Player', 'Polling stopped')
	}
	currentPlayerState = 'stopped'
	isPolling = false
}

export const pauseSong = async () => {
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	const success = await UPNP.pauseOnDevice(device)
	if (success) {
		updateStatus({ state: 'paused' })
		globalSongDispatch?.({ type: 'setPlaying', state: State.Paused })
		// Switch to slow polling when paused
		startStatusPolling('paused')
	}
	return success
}

export const resumeSong = async () => {
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	if (!currentPlaybackUrl) {
		logger.warn('UPNP-Player', 'No URL stored for resume')
		return false
	}

	const success = await UPNP.playOnDevice(device, currentPlaybackUrl, currentPlaybackMetadata)
	if (success) {
		updateStatus({ state: 'playing' })
		globalSongDispatch?.({ type: 'setPlaying', state: State.Playing })
		// Fast polling when playing
		startStatusPolling('playing')
	}
	return success
}

export const stopSong = async () => {
	const device = getUpnpDevice()

	// Always stop polling, even if no device (cleanup)
	stopStatusPolling()

	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	const success = await UPNP.stopOnDevice(device)
	if (success) {
		updateStatus({ state: 'stopped' })
		globalSongDispatch?.({ type: 'setPlaying', state: State.Stopped })
	}
	return success
}

export const setIndex = async (config, songDispatch, queue, index) => {
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}

	const song = queue[index]
	if (!song || !config) {
		logger.error('UPNP-Player', 'Song or config missing')
		return false
	}

	const streamUrl = urlStream(config, song.id, global.streamFormat || 'mp3', global.maxBitRate || 0)
	const metadata = {
		title: song.title,
		artist: song.artist,
		album: song.album,
		coverUrl: song.coverArt ? urlCover(config, song) : '',
	}

	await LocalPlayer.stopSong()
	const success = await UPNP.playOnDevice(device, streamUrl, metadata)

	if (success) {
		currentPlaybackUrl = streamUrl
		currentPlaybackMetadata = metadata
		songDispatch({ type: 'setIndex', index })
		songDispatch({ type: 'setPlaying', state: State.Playing })
		updateStatus({ state: 'playing' })
		// Fast polling when playing
		startStatusPolling('playing')
	}

	return success
}

export const playSong = async (config, songDispatch, queue, index) => {
	songDispatch({ type: 'setQueue', queue, index })
	return setIndex(config, songDispatch, queue, index)
}

export const nextSong = async (config, song, songDispatch) => {
	if (!song.queue) {
		logger.warn('UPNP-Player', 'No queue available')
		return
	}

	const nextIndex = song.actionEndOfSong === 'random'
		? nextRandomIndex()
		: (song.index + 1) % song.queue.length

	await setIndex(config, songDispatch, song.queue, nextIndex)

	if (song.actionEndOfSong === 'repeat') {
		songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (!song.queue) {
		logger.warn('UPNP-Player', 'No queue available')
		return
	}

	const prevIndex = song.actionEndOfSong === 'random'
		? prevRandomIndex()
		: (song.queue.length + song.index - 1) % song.queue.length

	await setIndex(config, songDispatch, song.queue, prevIndex)

	if (song.actionEndOfSong === 'repeat') {
		songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	}
}

export const setPosition = async (position) => {
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}
	return UPNP.seekOnDevice(device, position)
}

export const setVolume = async (volume) => {
	const device = getUpnpDevice()
	if (!device) {
		logger.error('UPNP-Player', 'No device selected')
		return false
	}
	return UPNP.setVolumeOnDevice(device, volume * 100)
}

export const getVolume = async () => {
	const device = getUpnpDevice()
	if (!device) return 1.0
	const volume = await UPNP.getVolumeFromDevice(device)
	return volume / 100
}

export const secondToTime = (second) => {
	if (!second) return '00:00'
	if (second === Infinity) return '∞:∞'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const setRepeat = async (songDispatch, action) => {
	songDispatch({ type: 'setActionEndOfSong', action })
}

export const resetAudio = (songDispatch) => {
	// Stop polling immediately to prevent memory leaks
	stopStatusPolling()
	songDispatch({ type: 'reset' })
	stopSong()
}

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

export const addToQueue = async (config, songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

// Compatibility stubs
export const initService = async () => {}
export const useEvent = () => {}
export const reload = async () => await resumeSong()
export const unloadSong = async () => {}
export const tuktuktuk = async () => {}
export const updateVolume = () => {}
export const isVolumeSupported = () => true

export const updateTime = () => {
	const [, forceUpdate] = React.useReducer(x => x + 1, 0)

	React.useEffect(() => {
		const interval = setInterval(forceUpdate, 500)
		return () => clearInterval(interval)
	}, [])

	return {
		position: currentTime,
		duration: currentDuration,
		buffered: 0
	}
}

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
