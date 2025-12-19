import { nextRandomIndex, prevRandomIndex, saveQueue } from '~/utils/tools'
import CastPlayer from '~/utils/player/playerCast'
import LocalPlayer from '~/utils/player/playerLocal'
import State from '~/utils/playerState'
import UpnpPlayer from '~/utils/player/playerUpnp'

let type = 'local'

const getPlayer = (forceType = null) => {
	const deviceType = forceType || type
	if (deviceType === 'local') return LocalPlayer
	else if (deviceType === 'chromecast') return CastPlayer
	else if (deviceType === 'upnp') return UpnpPlayer
	return null
}

export const initService = LocalPlayer.initService

export const initPlayer = async (songDispatch) => {
	await LocalPlayer.initPlayer(songDispatch)
	await UpnpPlayer.initPlayer(songDispatch)
	await CastPlayer.initPlayer(songDispatch)
}

export const useEvent = (song, songDispatch) => {
	LocalPlayer.useEvent(song, songDispatch, nextSong)
	CastPlayer.useEvent(song, songDispatch, nextSong)
	UpnpPlayer.useEvent(song, songDispatch, nextSong)
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
	return getPlayer().reload()
}

export const pauseSong = async () => {
	return getPlayer().pauseSong()
}

export const resumeSong = async () => {
	return getPlayer().resumeSong()
}

export const stopSong = async () => {
	return getPlayer().stopSong()
}

export const downloadSong = async (urlStream, id) => {
	return getPlayer().downloadSong(urlStream, id)
}

export const downloadNextSong = async (queue, currentIndex) => {
	return getPlayer().downloadNextSong(queue, currentIndex)
}

export const playSong = async (config, songDispatch, queue, index) => {
	await loadSong(config, queue, index)
	songDispatch({ type: 'setQueue', queue, index })
	songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	saveQueue(config, queue, index)
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

export const secondToTime = (second) => {
	if (!second) return '00:00'
	if (second === Infinity) return '∞:∞'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const setPosition = async (position) => {
	return getPlayer().setPosition(position)
}

export const setVolume = async (volume) => {
	return getPlayer().setVolume(volume)
}

export const getVolume = () => {
	return getPlayer().getVolume()
}

export const setRepeat = async (songdispatch, action) => {
	songdispatch({ type: 'setActionEndOfSong', action })
}

export const loadSong = async (config, queue, index) => {
	return getPlayer().loadSong(config, queue, index)
}

export const unloadSong = async () => { }
export const tuktuktuk = async (songDispatch) => {
	return getPlayer().tuktuktuk(songDispatch)
}

export const setIndex = async (config, songDispatch, queue, index) => {
	if (queue && index >= 0 && index < queue.length) {
		loadSong(config, queue, index)
		songDispatch({ type: 'setIndex', index })
	}
}

export const updateVolume = () => { }
export const updateTime = () => {
	const localTime = LocalPlayer.updateTime()
	const upnpTime = UpnpPlayer.updateTime()
	const chromecastTime = CastPlayer.updateTime()

	if (type === 'chromecast') return chromecastTime
	else if (type === 'upnp') return upnpTime
	return localTime
}

export const isVolumeSupported = () => {
	return false
}

export const resetAudio = (songDispatch) => {
	return getPlayer().resetAudio(songDispatch)
}

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

// when index is null, add to the end of the queue
export const addToQueue = (songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

export const connect = async (device, newType) => {
	await getPlayer(newType).connect(device)
}

export const disconnect = async (device) => {
	return getPlayer().disconnect(device)
}

export const switchPlayer = async (newType) => {
	type = newType
}

export const saveState = async () => {
	return getPlayer().saveState()
}

export default {
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
	restoreState,
	saveState,
	connect,
	disconnect,
	switchPlayer,
	State
}