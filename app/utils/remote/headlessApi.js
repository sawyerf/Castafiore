import React from 'react'
import { getApi } from '~/utils/api'
import { urlStream } from '~/utils/url'
import State from '~/utils/playerState'
import logger from '~/utils/logger'

let getBaseUrl = null

export const configureBaseUrl = (fn) => {
	getBaseUrl = fn
}

const isHeadlessActive = () => global.webPlayerType === 'headless'
export const isMpdActive = (status) => status.state === 'play' || status.state === 'pause'

const api = async (method, endpoint, body) => {
	const res = await fetch(`${getBaseUrl()}/api${endpoint}`, {
		method,
		headers: body ? { 'Content-Type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined,
	})
	return res.json()
}

let statusInterval = null
let prevState = null
let currentProgress = { position: 0, duration: 0 }
let progressListeners = []
let volumeListeners = []

const notifyProgress = (position, duration) => {
	currentProgress = { position, duration }
	progressListeners.forEach(fn => fn(currentProgress))
}

const notifyVolume = (volume) => {
	global.headlessVolume = volume
	volumeListeners.forEach(fn => fn(volume))
}

const startPolling = (songDispatch, nextSong) => {
	if (statusInterval) return
	statusInterval = setInterval(async () => {
		if (!getBaseUrl()) return
		try {
			const status = await api('GET', '/status')
			notifyVolume(status.volume / 100)

			if (!isHeadlessActive()) return

			if (!global.song?.songInfo) return
			const state = status.state === 'play' ? State.Playing
				: status.state === 'pause' ? State.Paused
				: State.Stopped

			notifyProgress(status.elapsed || 0, status.duration || 0)

			if (status.songPos >= 0 && global.song?.queue && status.songPos !== global.song.index) {
				songDispatch({ type: 'setIndex', index: status.songPos })
			}

			if (state !== prevState) {
				const wasPlaying = prevState === State.Playing
				prevState = state
				songDispatch({ type: 'setState', state })

				if (state === State.Stopped && wasPlaying) {
					if (global.song?.actionEndOfSong === 'repeat') {
						await api('POST', '/seek', { position: 0 })
						await api('POST', '/resume')
					} else {
						nextSong(global.config, global.song, songDispatch)
					}
				}
			}
		} catch (e) {
			logger.error('PlayerHeadless', e.message)
		}
	}, 1000)
}

const stopPolling = () => {
	clearInterval(statusInterval)
	statusInterval = null
	prevState = null
	currentProgress = { position: 0, duration: 0 }
}

export const initPlayer = async (songDispatch) => {
	if (!isHeadlessActive()) return
	try {
		const status = await api('GET', '/status')
		if (status.track && status.songPos >= 0) {
			const song = {
				queue: null,
				songInfo: status.track,
				index: status.songPos,
				actionEndOfSong: 'next',
				randomIndex: [],
			}
			songDispatch({ type: 'restore', song, isSongLoad: isMpdActive(status) })
			if (isMpdActive(status)) {
				songDispatch({ type: 'setState', state: status.state === 'play' ? State.Playing : State.Paused })
			}
		}
	} catch (e) {
		logger.error('PlayerHeadless', 'initPlayer:', e.message)
	}
}

export const useEvent = (_song, songDispatch, nextSong) => {
	React.useEffect(() => {
		startPolling(songDispatch, nextSong)
		return () => stopPolling()
	}, [])
}

export const loadSong = async (config, queue, index) => {
	const urls = queue.map(track => urlStream(config, track.id, global.streamFormat, global.maxBitRate))
	getApi(config, 'scrobble', { id: queue[index].id, submission: false }).catch(() => { })
	await api('POST', '/load', { urls, index, queue })
}

export const pauseSong = async () => api('POST', '/pause')

export const resumeSong = async () => api('POST', '/resume')

export const stopSong = async () => api('POST', '/stop')

export const setPosition = async (position) => {
	if (!position || position < 0 || position === Infinity) return
	await api('POST', '/seek', { position })
}

export const setVolume = async (volume) => {
	volume = Math.max(0, Math.min(1, volume))
	await api('POST', '/volume', { volume })
}

export const getVolume = () => global.headlessVolume ?? 1.0

export const updateTime = () => {
	const [progress, setProgress] = React.useState(currentProgress)

	React.useEffect(() => {
		const listener = (p) => setProgress({ ...p })
		progressListeners.push(listener)
		return () => { progressListeners = progressListeners.filter(fn => fn !== listener) }
	}, [])

	return progress
}

export const updateVolume = () => {
	const [volume, setVol] = React.useState(global.headlessVolume ?? 1.0)

	React.useEffect(() => {
		const listener = (v) => setVol(v)
		volumeListeners.push(listener)
		return () => { volumeListeners = volumeListeners.filter(fn => fn !== listener) }
	}, [])

	return volume
}

const fetchStatus = () => api('GET', '/status')

export const saveState = async () => {
	try {
		const status = await fetchStatus()
		return { position: status.elapsed || 0, isPlaying: status.state === 'play' }
	} catch {
		return { position: 0, isPlaying: false }
	}
}

export const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	api('POST', '/stop')
}

export const isVolumeSupported = () => true
export const disconnect = async () => {
	prevState = null
	await api('POST', '/stop').catch(() => { })
	await api('POST', '/clear').catch(() => { })
}
export const downloadSong = async () => { }
export const unloadSong = async () => { }
export const tuktuktuk = async () => { }
export const reload = async () => { }

export default {
	initPlayer,
	useEvent,
	loadSong,
	pauseSong,
	resumeSong,
	stopSong,
	setPosition,
	setVolume,
	getVolume,
	updateTime,
	updateVolume,
	saveState,
	resetAudio,
	isVolumeSupported,
	disconnect,
	downloadSong,
	unloadSong,
	tuktuktuk,
	reload,
}
