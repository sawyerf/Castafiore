/**
 * Chromecast Player Module
 * Handles audio playback to Chromecast devices via react-native-google-cast.
 */

import React from 'react'
import GoogleCast from 'react-native-google-cast'
import { urlCover, urlStream } from '~/utils/url'
import { nextRandomIndex, prevRandomIndex } from '~/utils/tools'
import logger from '~/utils/logger'
import LocalPlayer from '~/utils/playerLocal'
import { State } from 'react-native-track-player'

let remoteContext = null
let globalSongDispatch = null
let statusPollingInterval = null
let currentTime = 0
let currentDuration = 0
let isPolling = false
let currentPlayerState = 'stopped'

// Polling intervals
const POLL_INTERVAL_PLAYING = 1000
const POLL_INTERVAL_PAUSED = 3000

export const initChromecastPlayer = (context) => {
	remoteContext = context
}

export const initPlayer = async (songDispatch) => {
	globalSongDispatch = songDispatch
	songDispatch({ type: 'init' })

	// Initialize Chromecast session
	try {
		await GoogleCast.getCastState()
	} catch (error) {
		logger.debug('Chromecast-Player', 'Init error:', error)
	}
}

const getChromecastDevice = () => remoteContext?.selectedDevice

const updateStatus = (status) => {
	remoteContext?.updateStatus?.(status)
}

const startStatusPolling = (state = 'playing') => {
	stopStatusPolling()

	currentPlayerState = state
	const interval = state === 'playing' ? POLL_INTERVAL_PLAYING : POLL_INTERVAL_PAUSED

	const pollStatus = async () => {
		const device = getChromecastDevice()
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
			const client = GoogleCast.getClient()
			const mediaStatus = await client.getMediaStatus()

			if (mediaStatus) {
				currentTime = mediaStatus.streamPosition || 0
				currentDuration = mediaStatus.mediaInfo?.streamDuration || 0

				const stateMap = {
					'PLAYING': State.Playing,
					'PAUSED': State.Paused,
					'IDLE': State.Stopped,
					'BUFFERING': State.Loading,
				}

				const playerState = mediaStatus.playerState
				if (stateMap[playerState]) {
					globalSongDispatch({
						type: 'setPlaying',
						state: stateMap[playerState]
					})

					// Update internal state
					const normalizedState = playerState === 'PLAYING' ? 'playing' :
					                       playerState === 'PAUSED' ? 'paused' : 'stopped'

					// Adjust polling interval if state changed
					if (normalizedState !== currentPlayerState) {
						currentPlayerState = normalizedState

						// Restart polling with new interval if needed
						if (normalizedState === 'playing' || normalizedState === 'paused') {
							stopStatusPolling()
							startStatusPolling(normalizedState)
						} else if (normalizedState === 'stopped') {
							stopStatusPolling()
						}
					}

					updateStatus({
						state: normalizedState,
						position: currentTime,
						duration: currentDuration,
						volume: mediaStatus.volume?.level || 0.5
					})
				}
			}
		} catch (error) {
			logger.debug('Chromecast-Player', 'Polling error:', error.message)
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
	const device = getChromecastDevice()
	if (!device) return false

	try {
		const client = GoogleCast.getClient()
		const success = await client.pause()
		if (success) {
			updateStatus({ state: 'paused' })
			globalSongDispatch?.({ type: 'setPlaying', state: State.Paused })
			// Switch to slow polling when paused
			startStatusPolling('paused')
		}
		return success
	} catch (error) {
		logger.error('Chromecast-Player', 'Pause error:', error)
		return false
	}
}

export const resumeSong = async () => {
	const device = getChromecastDevice()
	if (!device) return false

	try {
		const client = GoogleCast.getClient()
		const success = await client.play()
		if (success) {
			updateStatus({ state: 'playing' })
			globalSongDispatch?.({ type: 'setPlaying', state: State.Playing })
			// Fast polling when playing
			startStatusPolling('playing')
		}
		return success
	} catch (error) {
		logger.error('Chromecast-Player', 'Resume error:', error)
		return false
	}
}

export const stopSong = async () => {
	const device = getChromecastDevice()

	stopStatusPolling()

	if (!device) return false

	try {
		const client = GoogleCast.getClient()
		const success = await client.stop()
		if (success) {
			updateStatus({ state: 'stopped' })
			globalSongDispatch?.({ type: 'setPlaying', state: State.Stopped })
		}
		return success
	} catch (error) {
		logger.error('Chromecast-Player', 'Stop error:', error)
		return false
	}
}

export const setIndex = async (config, songDispatch, queue, index) => {
	const device = getChromecastDevice()
	if (!device) return false

	const song = queue[index]
	if (!song || !config) return false

	const streamUrl = urlStream(config, song.id, global.streamFormat || 'mp3', global.maxBitRate || 0)
	const coverUrl = song.coverArt ? urlCover(config, song) : ''

	await LocalPlayer.stopSong()

	try {
		const client = GoogleCast.getClient()

		const mediaInfo = {
			contentUrl: streamUrl,
			contentType: 'audio/mpeg',
			metadata: {
				type: 'musicTrack',
				title: song.title || 'Unknown',
				artist: song.artist || 'Unknown',
				albumName: song.album || 'Unknown',
				images: coverUrl ? [{ url: coverUrl }] : []
			}
		}

		const success = await client.loadMedia(mediaInfo)

		if (success) {
			songDispatch({ type: 'setIndex', index })
			songDispatch({ type: 'setPlaying', state: State.Playing })
			updateStatus({ state: 'playing' })
			startStatusPolling('playing')
		}

		return success
	} catch (error) {
		logger.error('Chromecast-Player', 'Load media error:', error)
		return false
	}
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
	const device = getChromecastDevice()
	if (!device) return false

	try {
		const client = GoogleCast.getClient()
		await client.seek({ position })
		return true
	} catch (error) {
		logger.error('Chromecast-Player', 'Seek error:', error)
		return false
	}
}

export const setVolume = async (volume) => {
	const device = getChromecastDevice()
	if (!device) return false

	try {
		const client = GoogleCast.getClient()
		await client.setVolume(volume)
		return true
	} catch (error) {
		logger.error('Chromecast-Player', 'Set volume error:', error)
		return false
	}
}

export const getVolume = async () => {
	const device = getChromecastDevice()
	if (!device) return 1.0

	try {
		const client = GoogleCast.getClient()
		const mediaStatus = await client.getMediaStatus()
		return mediaStatus?.volume?.level || 1.0
	} catch (error) {
		logger.error('Chromecast-Player', 'Get volume error:', error)
		return 1.0
	}
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

export { State }

export default {
	initChromecastPlayer,
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
