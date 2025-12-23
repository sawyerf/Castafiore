import React from 'react'
import GoogleCast, { useStreamPosition, useRemoteMediaClient } from 'react-native-google-cast'

import { getApi } from '~/utils/api'
import { urlCover, urlStream } from '~/utils/url'
import { useRemote } from '~/contexts/remote/use'
import { useSong } from '~/contexts/song/use'
import logger from '~/utils/logger'
import State from '~/utils/playerState'

const initPlayer = async (_songDispatch) => { }

const convertState = {
	'buffering': State.Loading,
	'idle': State.None,
	'loading': State.Loading,
	'paused': State.Paused,
	'playing': State.Playing,
}

const useEvent = (_song, songDispatch, nextSong) => {
	const client = useRemoteMediaClient()
	const remote = useRemote()

	React.useEffect(() => {
		if (!client) return
		const sessionManager = GoogleCast.getSessionManager()
		const event = sessionManager.onSessionSuspended(() => {
			logger.info('RemotePlayer', 'Session suspended')
			remote.selectDevice(null)
		})
		return () => event.remove()
	}, [client, remote])

	React.useEffect(() => {
		const events = []
		if (!client) return
		const sessionManager = GoogleCast.getSessionManager()

		events.push(sessionManager.onSessionEnded(() => {
			logger.info('RemotePlayer', 'Session ended')
		}))

		events.push(client.onMediaStatusUpdated((mediaStatus) => {
			if (!mediaStatus) return
			songDispatch({ type: 'setState', state: convertState[mediaStatus?.playerState || State.Stopped] })
		}))

		events.push(client.onMediaPlaybackEnded((_mediaStatus) => {
			if (!global.song?.queue?.length) return
			getApi(global.config, 'scrobble', { id: global.song.songInfo.id, submission: true })
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

const reload = async () => {
	// await TrackPlayer.retry()
}

const pauseSong = async () => {
	const client = await getClient()
	await client.pause()
}

const resumeSong = async () => {
	const client = await getClient()
	await client.play()
}

const stopSong = async () => {
	const client = await getClient()
	await client.stop()
}

const downloadSong = async (_urlStream, _id) => {
}

const downloadNextSong = async (_queue, _currentIndex) => {
}

const loadSong = async (config, queue, index) => {
	const track = queue[index]
	const client = await getClient()

	getApi(config, 'scrobble', { id: track.id, submission: false })
		.catch(() => { })
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

const setPosition = async (position) => {
	if (position < 0 || !position) position = 0
	if (position === Infinity) return

	const client = await getClient()
	await client.seek({ position })
}

const setVolume = async (volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	const client = await getClient()

	await client.setVolume(volume)
}

const getVolume = () => {
	// return TrackPlayer.getVolume()
	return 1
}

const unloadSong = async () => { }
const tuktuktuk = async (_songDispatch) => { }

const updateVolume = () => { }
const updateTime = () => {
	const streamPosition = useStreamPosition()
	const song = useSong()

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

const isVolumeSupported = () => {
	return false
}

const resetAudio = async (songDispatch) => {
	songDispatch({ type: 'reset' })
	const client = await getClient()
	client.stop()
}

const saveState = async () => {
	const client = await getClient()
	if (!client) return {
		position: 0,
		isPlaying: false,
	}

	const mediaStatus = await client.getMediaStatus()
	return {
		position: await client.getStreamPosition(),
		isPlaying: mediaStatus?.playerState === 'playing',
	}
}

const connectAndWait = (deviceId) => {
	return new Promise((resolve, reject) => {
		const events = []
		const sessionManager = GoogleCast.getSessionManager()
		const timeoutId = setTimeout(() => {
			events.forEach((event) => event.remove())
			reject(new Error('Connection to device timed out'))
		}, 30 * 1000)
		events.push(sessionManager.onSessionStarted(() => {
			clearTimeout(timeoutId)
			events.forEach((event) => event.remove())
			resolve()
		}))
		events.push(sessionManager.onSessionStartFailed((_session, error) => {
			clearTimeout(timeoutId)
			events.forEach((event) => event.remove())
			reject(error)
		}))
		events.push(sessionManager.onSessionEnded(() => {
			clearTimeout(timeoutId)
			events.forEach((event) => event.remove())
			reject(new Error('Session ended'))
		}))
		sessionManager.startSession(deviceId)
	})
}

const connect = async (device) => {
	const sessionManager = GoogleCast.getSessionManager()
	const currentSession = await sessionManager.getCurrentCastSession()
	if (currentSession) {
		const currentDevice = await currentSession.getCastDevice()
		if (device.id === currentDevice?.deviceId) return
	}
	await connectAndWait(device.id)
}

const disconnect = async (_device) => {
	await stopSong()
	const sessionManager = GoogleCast.getSessionManager()
	await sessionManager.endCurrentSession(true)
}

export default {
	initPlayer,
	pauseSong,
	resumeSong,
	stopSong,
	setPosition,
	setVolume,
	getVolume,
	unloadSong,
	loadSong,
	tuktuktuk,
	updateVolume,
	updateTime,
	isVolumeSupported,
	reload,
	useEvent,
	resetAudio,
	saveState,
	downloadNextSong,
	downloadSong,
	connect,
	disconnect,
}