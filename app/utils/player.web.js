import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as serviceWorkerRegistration from '~/services/serviceWorkerRegistration'

import { getApi } from '~/utils/api'
import { urlStream, urlCover } from './url'
import { nextRandomIndex, prevRandomIndex, saveQueue } from '~/utils/tools'
import State from '~/utils/playerState'
import logger from '~/utils/logger'

const audio = () => {
	return document.getElementById('audio')
}

export const initService = async () => {
	serviceWorkerRegistration.register()
}

export const initPlayer = async (songDispatch) => {
	const song = await AsyncStorage.getItem('song')
		.then((song) => song ? JSON.parse(song) : null)
	const sound = audio()
	global.isVolumeSupported = false
	songDispatch({ type: 'init' })
	if (song) songDispatch({ type: 'restore', song, isSongLoad: false })

	sound.addEventListener('error', () => {
		songDispatch({ type: 'setState', state: State.Error })
	})
	sound.addEventListener('loadstart', () => {
		songDispatch({ type: 'setState', state: State.Loading })
	})
	sound.addEventListener('waiting', () => {
		songDispatch({ type: 'setState', state: State.Loading })
	})
	sound.addEventListener('canplay', () => {
		audio().play()
	})
	sound.addEventListener('loadedmetadata', () => {
		audio().play()
	})
	sound.addEventListener('loadeddata', () => {
		audio().play()
	})
	sound.addEventListener('playing', () => {
		navigator.mediaSession.playbackState = 'playing'
		songDispatch({ type: 'setState', state: State.Playing })
	})
	sound.addEventListener('play', () => {
		navigator.mediaSession.playbackState = 'playing'
		songDispatch({ type: 'setState', state: State.Playing })
	})
	sound.addEventListener('pause', () => {
		navigator.mediaSession.playbackState = 'paused'
		songDispatch({ type: 'setState', state: State.Paused })
	})
	sound.addEventListener('volumechange', () => {
		global.isVolumeSupported = true
	})
	sound.volume = 0.99
	sound.volume = 1
	sound.addEventListener('ended', () => {
		const songId = global.song.songInfo.id

		if (global.song.actionEndOfSong === 'repeat') {
			if (audio().duration < 1) {
				reload()
				// This return is necessary to avoid scrobble if a bug occurs
				return
			} else {
				setPosition(0)
				resumeSong()
			}
		} else {
			nextSong(global.config, global.song, songDispatch)
		}
		getApi(global.config, 'scrobble', { id: songId, submission: true })
			.catch(() => { })
	})
	sound.addEventListener('canplaythrough', () => {
		downloadNextSong(global.config, global.song.queue, global.song.index)
	})

	navigator.mediaSession.setActionHandler("pause", () => {
		pauseSong()
	})
	navigator.mediaSession.setActionHandler("play", () => {
		resumeSong()
	})
	navigator.mediaSession.setActionHandler("seekto", (details) => {
		setPosition(details.seekTime)
	})
	navigator.mediaSession.setActionHandler("previoustrack", () => {
		previousSong(global.config, global.song, songDispatch)
	})
	navigator.mediaSession.setActionHandler("nexttrack", () => {
		nextSong(global.config, global.song, songDispatch)
	})
	navigator.mediaSession.setActionHandler("seekbackward", () => {
		previousSong(global.config, global.song, songDispatch)
	})
	navigator.mediaSession.setActionHandler("seekforward", () => {
		nextSong(global.config, global.song, songDispatch)
	})

	addEventListener('keydown', (e) => {
		if (e.key === ' ') {
			if (global.song.state === State.Playing) pauseSong()
			else resumeSong()
			e.preventDefault()
		} else if (e.key === 'ArrowRight') {
			nextSong(global.config, global.song, songDispatch)
			e.preventDefault()
		}
		else if (e.key === 'ArrowLeft') {
			previousSong(global.config, global.song, songDispatch)
			e.preventDefault()
		}
		else if (e.key === 'ArrowUp') {
			setVolume(getVolume() + 0.1)
			e.preventDefault()
		}
		else if (e.key === 'ArrowDown') {
			setVolume(getVolume() - 0.1)
			e.preventDefault()
		} else if (e.key === 'm') {
			setVolume(getVolume() ? 0 : 1)
			e.preventDefault()
		}
	})
}

export const useEvent = (_song, _songDispatch) => { }

export const updateTime = () => {
	const [time, setTime] = React.useState({
		position: audio().currentTime,
		duration: audio().duration,
	})

	React.useEffect(() => {
		const sound = audio()
		const timeUpdateHandler = () => {
			setTime({
				position: audio().currentTime,
				duration: audio().duration,
			})
		}

		sound.addEventListener('timeupdate', timeUpdateHandler)
		sound.addEventListener('durationchange', timeUpdateHandler)
		return () => {
			sound.removeEventListener('timeupdate', timeUpdateHandler)
			sound.removeEventListener('durationchange', timeUpdateHandler)
		}
	}, [])

	return time
}

export const downloadSong = async (url, _id) => {
	return fetch(url)
}

const downloadNextSong = async (config, queue, currentIndex) => {
	if (!global.isSongCaching) return
	const maxIndex = Math.min(global.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (!queue[index].isDownloaded && queue[index].id.match(/^[a-zA-Z0-9-]*$/)) {
			await fetch(urlStream(config, queue[index].id, global.streamFormat, global.maxBitRate))
				.then(() => { queue[index].isDownloaded = true })
				.catch(() => { })
		}
	}
}

export const unloadSong = async () => { }

const loadSong = async (config, queue, index) => {
	const song = queue[index]
	const sound = audio()

	sound.src = urlStream(config, song.id, global.streamFormat, global.maxBitRate)
	sound.play()
		.then(() => {
			getApi(config, 'scrobble', { id: song.id, submission: false })
				.catch(() => { })
		})
		.catch((error) => {
			logger.error('loadSong', error)
		})
	navigator.mediaSession.metadata = new MediaMetadata({
		title: song.title,
		artist: song.artist,
		album: song.album,
		artwork: [{ src: urlCover(config, song) }],
	})
}

export const playSong = async (config, songDispatch, queue, index) => {
	await loadSong(config, queue, index)
	songDispatch({ type: 'setQueue', queue, index })
	setRepeat(songDispatch, 'next')
	saveQueue(config, queue, index)
}

export const setIndex = async (config, songDispatch, queue, index) => {
	if (queue && index >= 0 && index < queue.length) {
		unloadSong()
		await loadSong(config, queue, index)
		songDispatch({ type: 'setIndex', index })
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

export const reload = async () => {
	audio().load()
}

export const pauseSong = async () => {
	audio().pause()
}

export const resumeSong = async () => {
	audio().play()
}

export const stopSong = async () => {
	audio().pause()
}

export const setPosition = async (position) => {
	if (position === Infinity) return
	const sound = audio()

	if (position < 0) position = 0
	if (position > sound.duration) position = sound.duration
	if (!sound.duration || position < 0) position = 0
	sound.currentTime = position
}

export const setVolume = async (volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	audio().volume = volume
}

export const getVolume = () => {
	return audio().volume
}

export const updateVolume = () => {
	const [volume, setVol] = React.useState(getVolume())

	React.useEffect(() => {
		const sound = audio()
		const volumeChangeHandler = () => {
			setVol(sound.volume)
		}

		sound.addEventListener('volumechange', volumeChangeHandler)
		return () => {
			sound.removeEventListener('volumechange', volumeChangeHandler)
		}
	}, [])

	return volume
}

export const secondToTime = (second) => {
	if (!second) return '00:00'
	if (second === Infinity) return '∞:∞'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const tuktuktuk = (_songDispatch) => {
	const sound = new Audio()
	sound.src = 'https://sawyerf.github.io/tuktuktuk.mp3'
	sound.addEventListener('loadedmetadata', () => {
		sound.play()
	})
	sound.addEventListener('ended', () => {
		sound.src = ''
	})
}

export const setRepeat = async (songdispatch, action) => {
	await songdispatch({ type: 'setActionEndOfSong', action })
}

export const isVolumeSupported = () => {
	return global.isVolumeSupported
}

export const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	const sound = audio()
	sound.src = ''
	sound.load()
	sound.pause()
	sound.currentTime = 0
}

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

// when index is null, add to the end of the queue
export const addToQueue = (songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

export default {
	initService,
	initPlayer,
	useEvent,
	updateTime,
	playSong,
	nextSong,
	previousSong,
	pauseSong,
	resumeSong,
	stopSong,
	setPosition,
	setVolume,
	getVolume,
	isVolumeSupported,
	updateVolume,
	secondToTime,
	tuktuktuk,
	setRepeat,
	reload,
	resetAudio,
	addToQueue,
	removeFromQueue,
	setIndex,
	State,
}