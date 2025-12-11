/**
 * Chromecast Player Module
 * Handles audio playback to Chromecast devices via react-native-google-cast.
 */

import GoogleCast from 'react-native-google-cast'
import { State } from 'react-native-track-player'

import { nextRandomIndex, prevRandomIndex } from '~/utils/tools'
import { urlCover, urlStream } from '~/utils/url'
import logger from '~/utils/logger'

let currentTime = 0
let currentPlayerState = 'stopped'

const getClient = async () => {
	const session = GoogleCast.getSessionManager()
	const currentSession = await session.getCurrentCastSession()
	return currentSession?.client
}

export const initChromecastPlayer = () => {
}

export const initPlayer = async (songDispatch) => {
	songDispatch({ type: 'init' })

	// Initialize Chromecast session
	try {
		await GoogleCast.getCastState()
	} catch (error) {
		logger.debug('Chromecast-Player', 'Init error:', error)
	}
}

export const pauseSong = async () => {
	const client = await getClient()
	await client.pause()
}

export const resumeSong = async () => {
	const client = await getClient()
	await client.play()
}

export const stopSong = async () => {
	const client = await getClient()
	await client.stop()
}

const loadSong = async (config, queue, index) => {
	const track = queue[index]

	const client = await getClient()
	client.loadMedia({
		mediaInfo: {
			contentUrl: urlStream(config, track.id, global.streamFormat, global.maxBitRate),
			metadata: {
				title: track.title,
				artist: track.artist,
				albumName: track.album,
				images: [
					{ url: urlCover(config, track), width: 1024, height: 1024 },
					{
						url: urlCover(config, track, 512),
						width: 512,
						height: 512
					},
					{
						url: urlCover(config, track, 256),
						width: 256,
						height: 256
					}
				],
				streamDuration: track.duration
			}
		}
	})
}

export const setIndex = async (config, songDispatch, queue, index) => {
	if (queue && index >= 0 && index < queue.length) {
		loadSong(config, queue, index)
		songDispatch({ type: 'setIndex', index })
	}
}

export const playSong = async (config, songDispatch, queue, index) => {
	loadSong(config, queue, index)
	songDispatch({ type: 'setQueue', queue, index})
	setRepeat(songDispatch, 'next')
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
	try {
		const client = await getClient()
		await client.seek({ position })
		return true
	} catch (error) {
		logger.error('Chromecast-Player', 'Seek error:', error)
		return false
	}
}

export const setVolume = async (volume) => {
	try {
		const client = await getClient()
		await client.setVolume(volume)
		return true
	} catch (error) {
		logger.error('Chromecast-Player', 'Set volume error:', error)
		return false
	}
}

export const getVolume = async () => {
	try {
		const client = await getClient()
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
export const initService = async () => { }
export const useEvent = () => { }
export const reload = async () => await resumeSong()
export const unloadSong = async () => { }
export const tuktuktuk = async () => { }
export const updateVolume = () => { }
export const isVolumeSupported = () => true

export const updateTime = () => {
	return {
		position: 0,
		duration: 0,
		buffered: 0
	}
}

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
