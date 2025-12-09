import { State } from 'react-native-track-player'

import LocalPlayer from '~/utils/player/playerLocal'
import UpnpPlayer from '~/utils/player/playerUpnp'
import ChromecastPlayer from '~/utils/player/playerChromecast'

let remoteContext = null

export const initPlayerRouter = (context) => {
	remoteContext = context
	UpnpPlayer.initUpnpPlayer(context)
	ChromecastPlayer.initChromecastPlayer(context)
}

const isRemoteActive = () => {
	return remoteContext?.selectedDevice != null
}

const getPlayer = () => {
	if (!isRemoteActive()) return LocalPlayer

	const deviceType = remoteContext?.selectedDevice?.type
	if (deviceType === 'chromecast') return ChromecastPlayer
	else if (deviceType === 'upnp') return UpnpPlayer
	return LocalPlayer
}

export const initService = async () => {
	return LocalPlayer.initService()
}

export const initPlayer = async (songDispatch) => {
	await LocalPlayer.initPlayer(songDispatch)
	await UpnpPlayer.initPlayer(songDispatch)
	await ChromecastPlayer.initPlayer(songDispatch)
}

export const useEvent = (song, songDispatch) => {
	return LocalPlayer.useEvent(song, songDispatch)
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

export const playSong = async (config, songDispatch, queue, index) => {
	return getPlayer().playSong(config, songDispatch, queue, index)
}

export const setIndex = async (config, songDispatch, queue, index) => {
	return getPlayer().setIndex(config, songDispatch, queue, index)
}

export const nextSong = async (config, song, songDispatch) => {
	return getPlayer().nextSong(config, song, songDispatch)
}

export const previousSong = async (config, song, songDispatch) => {
	return getPlayer().previousSong(config, song, songDispatch)
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

export const reload = async () => {
	return getPlayer().reload()
}

export const setRepeat = async (songDispatch, action) => {
	return getPlayer().setRepeat(songDispatch, action)
}

export const resetAudio = (songDispatch) => {
	return getPlayer().resetAudio(songDispatch)
}

export const removeFromQueue = async (songDispatch, index) => {
	return getPlayer().removeFromQueue(songDispatch, index)
}

export const addToQueue = async (config, songDispatch, track, index = null) => {
	return getPlayer().addToQueue(config, songDispatch, track, index)
}

export const saveState = async () => {
	return getPlayer().saveState()
}

export const restoreState = async (state) => {
	return getPlayer().restoreState(state)
}

export const secondToTime = LocalPlayer.secondToTime
export const unloadSong = LocalPlayer.unloadSong
export const tuktuktuk = LocalPlayer.tuktuktuk
export const updateVolume = LocalPlayer.updateVolume

export const updateTime = () => {
	const localTime = LocalPlayer.updateTime()
	const upnpTime = UpnpPlayer.updateTime()
	const chromecastTime = ChromecastPlayer.updateTime()

	if (!isRemoteActive()) {
		return localTime
	}

	const deviceType = remoteContext?.selectedDevice?.type
	if (deviceType === 'chromecast') return chromecastTime
	else if (deviceType === 'upnp') return upnpTime
	return localTime
}

export const isVolumeSupported = () => {
	return getPlayer().isVolumeSupported()
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
	saveState,
	restoreState,
	State,
}
