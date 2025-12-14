import React from 'react'
import GoogleCast, { useStreamPosition, useRemoteMediaClient } from 'react-native-google-cast'

import { getApi } from '~/utils/api'
import { urlCover, urlStream } from '~/utils/url'
import { nextRandomIndex, prevRandomIndex, saveQueue } from '~/utils/tools'
import { SongContext } from '~/contexts/song'

export const initPlayer = async (_songDispatch) => { }

const convertState = {
	'buffering': 'loading',
	'idle': 'stopped',
	'loading': 'loading',
	'paused': 'paused',
	'playing': 'playing',
}

export const useEvent = (_song, songDispatch) => {
	const client = useRemoteMediaClient()

	React.useEffect(() => {
		const events = []
		if (!client) return

		events.push(client.onMediaStatusUpdated((mediaStatus) => {
			if (!mediaStatus) return
			songDispatch({ type: 'setPlaying', state: convertState[mediaStatus?.playerState || 'stopped'] })
		}))

		events.push(client.onMediaPlaybackEnded((_mediaStatus) => {
			if (!global.song?.queue?.length) return
			getApi(global.config, 'scrobble', `id=${global.song.songInfo.id}&submission=true`)
				.catch(() => { })
			if (global.song.actionEndOfSong === 'repeat') {
				client.seek(0)
			} else if (!global.repeatQueue && global.song.index === global.song.queue.length - 1) {
				client.stop()
			} else nextSong(global.config, global.song, songDispatch)
		}))

		return () => events.forEach((event) => event.remove())
	}, [client])
}

const getClient = async () => {
	const session = GoogleCast.getSessionManager()
	const currentSession = await session.getCurrentCastSession()
	return currentSession?.client
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		if (song.actionEndOfSong === 'random') await setIndex(config, songDispatch, song.queue, prevRandomIndex())
		else {
			if (!global.repeatQueue && song.index === 0) return
			await setIndex(config, songDispatch, song.queue, (song.queue.length + song.index - 1) % song.queue.length)
		}
		if (song.actionEndOfSong === 'repeat') await setRepeat(songDispatch, 'next')
	}
}

export const nextSong = async (config, song, songDispatch) => {
	if (song.queue) {
		if (song.actionEndOfSong === 'random') await setIndex(config, songDispatch, song.queue, nextRandomIndex())
		else {
			if (!global.repeatQueue && song.index === song.queue.length - 1) return
			await setIndex(config, songDispatch, song.queue, (song.index + 1) % song.queue.length)
		}
		if (song.actionEndOfSong === 'repeat') await setRepeat(songDispatch, 'next')
	}
}

export const reload = async () => {
	// await TrackPlayer.retry()
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

export const downloadSong = async (_urlStream, _id) => {
}

export const downloadNextSong = async (_queue, _currentIndex) => {
}

const loadSong = async (config, queue, index) => {
	const track = queue[index]
	const client = await getClient()

	await client.loadMedia({
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

export const playSong = async (config, songDispatch, queue, index) => {
	await loadSong(config, queue, index)
	songDispatch({ type: 'setQueue', queue, index })
	setRepeat(songDispatch, 'next')
	saveQueue(config, queue, index)
}

export const setPosition = async (position) => {
	if (position < 0 || !position) position = 0
	if (position === Infinity) return

	const client = await getClient()
	await client.seek({ position })
}

export const setVolume = async (volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	const client = await getClient()

	await client.setVolume(volume)
}

export const getVolume = () => {
	// return TrackPlayer.getVolume()
	return 1
}

export const setRepeat = async (songdispatch, action) => {
	songdispatch({ type: 'setActionEndOfSong', action })
	// TrackPlayer.setRepeatMode(RepeatMode.Off)
}

export const unloadSong = async () => { }
export const tuktuktuk = async (_songDispatch) => { }

export const setIndex = async (config, songDispatch, queue, index) => {
	if (queue && index >= 0 && index < queue.length) {
		loadSong(config, queue, index)
		songDispatch({ type: 'setIndex', index })
	}
}

export const updateVolume = () => { }
export const updateTime = () => {
	const streamPosition = useStreamPosition()
	const song = React.useContext(SongContext)

	if (streamPosition !== null) {
		return {
			position: streamPosition,
			duration: song?.songInfo?.duration || 0,
		}
	}
	return {
		position: 0,
		duration: 0,
	}
}

export const isVolumeSupported = () => {
	return false
}

export const resetAudio = async (songDispatch) => {
	songDispatch({ type: 'reset' })
	const client = await getClient()
	client.stop()
}

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

// when index is null, add to the end of the queue
export const addToQueue = (songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

export const saveState = async () => {
	const client = await getClient()
	return {
		position: await client.getStreamPosition(),
		isPlaying: (await client.getMediaStatus()).playerState === 'playing',
	}
}

export const restoreState = async (state) => {
	if (!state) return

	if (state.position > 0) {
		await setPosition(state.position)
	}

	if (state.isPlaying) {
		await resumeSong()
	}
}

export const connect = (device) => {
	return new Promise((resolve) => {
		const sessionManager = GoogleCast.getSessionManager()
		const event = sessionManager.onSessionStarted(() => {
			event.remove()
			resolve()
		})
		sessionManager.startSession(device.id)
	})
}

export const disconnect = async (_device) => {
	const sessionManager = GoogleCast.getSessionManager()
	await sessionManager.endCurrentSession(true)
}

export default {
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
	downloadNextSong,
	downloadSong,
	connect,
	disconnect,
}