import React from 'react'

import { getApi } from '~/utils/api'
import { nextRandomIndex, prevRandomIndex, saveQueue } from '~/utils/tools'
import { urlCover, urlStream } from '~/utils/url'
import UPNP from '~/utils/remote/upnp'
import UpnpEvent, { Events } from '~/utils/remote/upnpEvents'

let device = null

export const initUpnpPlayer = (context) => {
	device = context.selectedDevice
}

export const initService = async () => { }

export const initPlayer = async (_songDispatch) => { }

export const useEvent = (song, songDispatch) => {
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
	await UPNP.pause(device)
}

export const resumeSong = async () => {
	await UPNP.resume(device)
}

export const stopSong = async () => {
	await UPNP.stop(device)
}

export const downloadSong = async (_urlStream, _id) => { }

export const downloadNextSong = async (_queue, _currentIndex) => { }

const loadSong = async (config, queue, index) => {
	await UPNP.load(device,
		urlStream(config, queue[index].id, global.streamFormat, global.maxBitRate),
		{
			title: queue[index].title,
			artist: queue[index].artist,
			album: queue[index].album,
			coverUrl: queue[index].coverArt ? urlCover(config, queue[index]) : '',
		}
	)
	await UPNP.resume(device)
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

	await UPNP.seek(device, position)
}

export const setVolume = async (volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	await UPNP.setVolume(device, volume * 100)
}

export const getVolume = async () => {
	const status = await UPNP.getDeviceStatus(device)
	return status ? status.volume / 100 : 1.0
}

export const setRepeat = async (songdispatch, action) => {
	songdispatch({ type: 'setActionEndOfSong', action })
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
	// const remote = useRemote()
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

export const isVolumeSupported = () => {
	return false
}

export const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	UPNP.stop(device) // TODO: delete track
}

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

// when index is null, add to the end of the queue
export const addToQueue = (songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

export const saveState = async () => {
	const progress = await UPNP.getPosition(device)
	const state = await UPNP.getTransportInfo(device)
	return {
		position: progress.position || 0,
		isPlaying: state.state === 'playing'
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

export const connect = async (device) => {
	UPNP.connect(device)
}

export const disconnect = async (device) => {
	await UPNP.stop(device)
	UPNP.disconnect(device)
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
	downloadNextSong,
	downloadSong,
	connect,
	disconnect,
}
