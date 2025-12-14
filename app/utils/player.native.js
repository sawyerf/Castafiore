import LocalPlayer from '~/utils/player/playerLocal'
import UpnpPlayer from '~/utils/player/playerUpnp'
import CastPlayer from '~/utils/player/playerCast'

let remoteContext = {
	type: 'local',
	selectedDevice: null,
}

const getPlayer = () => {
	const deviceType = remoteContext?.type
	if (deviceType === 'chromecast') return CastPlayer
	else if (deviceType === 'upnp') return UpnpPlayer
	return LocalPlayer
}

export const initService = LocalPlayer.initService

export const initPlayerRouter = (context) => {
	remoteContext = context
	UpnpPlayer.initUpnpPlayer(context)
	CastPlayer.initChromecastPlayer(context)
}

export const initPlayer = async (songDispatch) => {
	await LocalPlayer.initPlayer(songDispatch)
	await UpnpPlayer.initPlayer(songDispatch)
	await CastPlayer.initPlayer(songDispatch)
}

export const useEvent = (song, songDispatch) => {
	LocalPlayer.useEvent(song, songDispatch)
	CastPlayer.useEvent(song, songDispatch)
	UpnpPlayer.useEvent(song, songDispatch)
}

export const previousSong = async (config, song, songDispatch) => {
	return getPlayer().previousSong(config, song, songDispatch)
}

export const nextSong = async (config, song, songDispatch) => {
	return getPlayer().nextSong(config, song, songDispatch)
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
	return getPlayer().playSong(config, songDispatch, queue, index)
}

export const restoreState = async (savedState) => {
	return getPlayer().restoreState(savedState)
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
	return getPlayer().setRepeat(songdispatch, action)
}

export const unloadSong = async () => { }
export const tuktuktuk = async (songDispatch) => {
	return getPlayer().tuktuktuk(songDispatch)
}

export const setIndex = async (config, songDispatch, queue, index) => {
	return getPlayer().setIndex(config, songDispatch, queue, index)
}

export const updateVolume = () => { }
export const updateTime = () => {
	const localTime = LocalPlayer.updateTime()
	const upnpTime = UpnpPlayer.updateTime()
	const chromecastTime = CastPlayer.updateTime()

	if (remoteContext.type === 'chromecast') return chromecastTime
	else if (remoteContext.type === 'upnp') return upnpTime
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

export const connect = async (device) => {
	return getPlayer().connect(device)
}

export const disconnect = async (device) => {
	return getPlayer().disconnect(device)
}

export default {
	initPlayerRouter,
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
	restoreState,
	connect,
	disconnect,
	State: LocalPlayer.State,
}