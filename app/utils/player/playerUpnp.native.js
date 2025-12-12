/**
 * UPNP/DLNA Player Module
 * Handles audio playback to external UPNP/DLNA devices via SOAP commands.
 */

import React from 'react'
import { State } from 'react-native-track-player'

import { nextRandomIndex, prevRandomIndex } from '~/utils/tools'
import { urlCover, urlStream } from '~/utils/url'
import LocalPlayer from '~/utils/player/playerLocal'
import logger from '~/utils/logger'
import UPNP from '~/utils/remote/upnp'

let upnpContext = null
let globalSongDispatch = null
let statusPollingInterval = null
let currentTime = 0
let currentDuration = 0
let isPolling = false
let currentPlayerState = 'stopped'
let trackEnded = false

// Polling intervals
const POLL_INTERVAL_PLAYING = 1000
const POLL_INTERVAL_PAUSED = 3000

export const initUpnpPlayer = (context) => {
	upnpContext = context
}

export const initPlayer = async (songDispatch) => {
	globalSongDispatch = songDispatch
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

		// Skip if already polling
		if (isPolling) {
			return
		}

		isPolling = true

		try {
			const status = await UPNP.getDeviceStatus(device)
			if (status) {
				currentTime = status.position
				currentDuration = status.duration

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

					// Check if track ended and play next song
					if (status.duration > 0 && status.position >= status.duration && !trackEnded) {
						trackEnded = true
						if (global.song?.actionEndOfSong === 'repeat') {
							await setPosition(0)
							await resumeSong()
						} else if (global.song?.queue && global.config) {
							await nextSong(global.config, global.song, globalSongDispatch)
						}
					}

					// Adjust polling interval if state changed
					if (status.state !== currentPlayerState) {
						currentPlayerState = status.state

						// Reset trackEnded when new track starts playing
						if (status.state === 'playing') {
							trackEnded = false
						}

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
			logger.debug('UPNP-Player', 'Polling error:', error.message)
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
	}
	currentPlayerState = 'stopped'
	isPolling = false
}

export const pauseSong = async () => {
	const device = getUpnpDevice()
	if (!device) return false

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
	if (!device) return false

	// Just send Play command without reloading the URI
	const success = await UPNP.resumeOnDevice(device)
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

	stopStatusPolling()

	if (!device) return false

	const success = await UPNP.stopOnDevice(device)
	if (success) {
		updateStatus({ state: 'stopped' })
		globalSongDispatch?.({ type: 'setPlaying', state: State.Stopped })
	}
	return success
}

export const setIndex = async (config, songDispatch, queue, index) => {
	const device = getUpnpDevice()
	if (!device) return false

	const song = queue[index]
	if (!song || !config) return false

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
		songDispatch({ type: 'setIndex', index })
		songDispatch({ type: 'setPlaying', state: State.Playing })
		updateStatus({ state: 'playing' })
		startStatusPolling('playing')
	}

	return success
}

export const playSong = async (config, songDispatch, queue, index) => {
	songDispatch({ type: 'setQueue', queue, index })
	return setIndex(config, songDispatch, queue, index)
}

export const nextSong = async (config, song, songDispatch) => {
	if (!song.queue) return

	const nextIndex = song.actionEndOfSong === 'random'
		? nextRandomIndex()
		: (song.index + 1) % song.queue.length

	await setIndex(config, songDispatch, song.queue, nextIndex)

	if (song.actionEndOfSong === 'repeat') {
		songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (!song.queue) return

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
	if (!device) return false
	return UPNP.seekOnDevice(device, position)
}

export const setVolume = async (volume) => {
	const device = getUpnpDevice()
	if (!device) return false
	return UPNP.setVolumeOnDevice(device, volume * 100)
}

export const getVolume = async () => {
	const device = getUpnpDevice()
	if (!device) return 1.0
	const status = await UPNP.getDeviceStatus(device)
	return status ? status.volume / 100 : 1.0
}

export const setRepeat = async (songDispatch, action) => {
	songDispatch({ type: 'setActionEndOfSong', action })
}

export const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	stopSong()
}

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

export const addToQueue = async (config, songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

export const saveState = async () => {
	return {
		position: currentTime || 0,
		isPlaying: currentPlayerState === 'playing'
	}
}

export const restoreState = async (state) => {
	if (!state) return

	// Wait for the track to load
	await new Promise(resolve => setTimeout(resolve, 500))

	if (state.position > 0) {
		await setPosition(state.position)
	}

	if (state.isPlaying) {
		await resumeSong()
	}
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
