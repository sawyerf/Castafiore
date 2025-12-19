import React from 'react'

import { getApi } from '~/utils/api'
import { urlCover, urlStream } from '~/utils/url'
import UPNP from '~/utils/remote/upnp'
import UpnpEvent, { Events } from '~/utils/remote/upnpEvents'
import State from '~/utils/playerState'

let device = null

const initPlayer = async (_songDispatch) => { }

const useEvent = (song, songDispatch, nextSong) => {
	React.useEffect(() => {
		let events = []

		events.push(UpnpEvent.addListener(Events.STATE_CHANGED, ({ state }) => {
			songDispatch({ type: 'setPlaying', state })
		}))

		events.push(UpnpEvent.addListener(Events.TRACK_ENDED, async () => {
			if (!global.song?.queue?.length) return
			getApi(global.config, 'scrobble', `id=${global.song.songInfo.id}&submission=true`)
				.catch(() => { })
			if (global.song.actionEndOfSong === 'repeat') {
				UPNP.seek(device, 0)
			} else if (!global.repeatQueue && global.song.index === global.song.queue.length - 1) {
				UPNP.stop(device)
			} else nextSong(global.config, global.song, songDispatch)
		}))

		return () => events.forEach(unsub => unsub())
	}, [songDispatch])
}

const reload = async () => {
	// await TrackPlayer.retry()
}

const pauseSong = async () => {
	await UPNP.pause(device)
}

const resumeSong = async () => {
	await UPNP.resume(device)
}

const stopSong = async () => {
	await UPNP.stop(device)
}

const downloadSong = async (_urlStream, _id) => { }

const downloadNextSong = async (_queue, _currentIndex) => { }

const loadSong = async (config, queue, index) => {
	const track = queue[index]

	getApi(config, 'scrobble', `id=${track.id}&submission=false`)
		.catch(() => { })
	await UPNP.load(device,
		urlStream(config, track.id, global.streamFormat, global.maxBitRate),
		{
			title: track.title,
			artist: track.artist,
			album: track.album,
			coverUrl: track.coverArt ? urlCover(config, track) : '',
		}
	)
	await UPNP.resume(device)
}

const setPosition = async (position) => {
	if (position < 0 || !position) position = 0
	if (position === Infinity) return

	await UPNP.seek(device, position)
}

const setVolume = async (volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	await UPNP.setVolume(device, volume * 100)
}

const getVolume = async () => {
	const status = await UPNP.getDeviceStatus(device)
	return status ? status.volume / 100 : 1.0
}

const unloadSong = async () => { }
const tuktuktuk = async (_songDispatch) => { }

const updateVolume = () => { }
const updateTime = () => {
	const [progress, setProgress] = React.useState({
		position: 0,
		duration: 0
	})

	React.useEffect(() => {
		const unsubscribe = UpnpEvent.addListener(Events.PROGRESS_CHANGED, ({ position, duration }) => {
			setProgress({ position, duration })
		})

		return unsubscribe
	}, [])

	return progress
}

const isVolumeSupported = () => {
	return false
}

const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	UPNP.stop(device) // TODO: delete track
}

const saveState = async () => {
	const progress = await UPNP.getPosition(device)
	const state = await UPNP.getState(device)
	return {
		position: progress.position || 0,
		isPlaying: state.state === State.Playing,
	}
}

const connect = async (newDevice) => {
	device = newDevice
	UPNP.connect(device)
}

const disconnect = async (device) => {
	await UPNP.stop(device)
	UPNP.disconnect(device)
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
