import React from 'react';
import * as serviceWorkerRegistration from '~/services/serviceWorkerRegistration';

import { getApi, urlCover, urlStream } from '~/utils/api';

const State = {
	None: 'none',
	Paused: 'paused',
	Playing: 'playing',
	Stopped: 'stopped',
	Ended: 'ended',
	Loading: 'loading',
	Error: 'error',
}

const audio = () => {
	return document.getElementById('audio')
}

export const initService = async () => {
	serviceWorkerRegistration.register();
}

export const initPlayer = async (songDispatch) => {
	const sound = audio()
	window.isVolumeSupported = false
	songDispatch({ type: 'init' })
	sound.addEventListener('error', () => {
		songDispatch({ type: 'setPlaying', state: State.Error })
	})
	sound.addEventListener('loadstart', () => {
		songDispatch({ type: 'setPlaying', state: State.Loading })
	})
	sound.addEventListener('waiting', () => {
		songDispatch({ type: 'setPlaying', state: State.Loading })
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
		songDispatch({ type: 'setPlaying', state: State.Playing })
	})
	sound.addEventListener('play', () => {
		navigator.mediaSession.playbackState = 'playing'
		songDispatch({ type: 'setPlaying', state: State.Playing })
	})
	sound.addEventListener('pause', () => {
		navigator.mediaSession.playbackState = 'paused'
		songDispatch({ type: 'setPlaying', state: State.Paused })
	})
	sound.addEventListener('volumechange', () => {
		window.isVolumeSupported = true
	})
	sound.volume = 0.99
	sound.volume = 1
	sound.addEventListener('ended', () => {
		const songId = window.song.songInfo.id

		if (window.song.actionEndOfSong === 'repeat') {
			if (audio().duration < 1) {
				reload()
				// This return is necessary to avoid scrobble if a bug occurs
				return
			} else {
				setPosition(0)
				resumeSong()
			}
		} else {
			nextSong(window.config, window.song, songDispatch)
		}
		getApi(window.config, 'scrobble', `id=${songId}&submission=true`)
			.catch(() => { })
	})
	sound.addEventListener('canplaythrough', () => {
		downloadNextSong(window.config, window.song.queue, window.song.index)
	})

	navigator.mediaSession.setActionHandler("pause", () => {
		pauseSong()
	});
	navigator.mediaSession.setActionHandler("play", () => {
		resumeSong()
	});
	navigator.mediaSession.setActionHandler("seekto", (details) => {
		setPosition(details.seekTime)
	});
	navigator.mediaSession.setActionHandler("previoustrack", () => {
		previousSong(window.config, window.song, songDispatch)
	});
	navigator.mediaSession.setActionHandler("nexttrack", () => {
		nextSong(window.config, window.song, songDispatch)
	});
	navigator.mediaSession.setActionHandler("seekbackward", () => {
		previousSong(window.config, window.song, songDispatch)
	});
	navigator.mediaSession.setActionHandler("seekforward", () => {
		nextSong(window.config, window.song, songDispatch)
	});

	addEventListener('keydown', (e) => {
		if (e.key === ' ') {
			if (window.song.state === State.Playing) pauseSong()
			else resumeSong()
			e.preventDefault()
		} else if (e.key === 'ArrowRight') {
			nextSong(window.config, window.song, songDispatch)
			e.preventDefault()
		}
		else if (e.key === 'ArrowLeft') {
			previousSong(window.config, window.song, songDispatch)
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

export const useEvent = (_songDispatch) => { }

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

const downloadNextSong = async (config, queue, currentIndex) => {
	if (!window.isSongCaching) return
	const maxIndex = Math.min(window.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (!queue[index].isDownloaded && queue[index].id.match(/^[a-zA-Z0-9-]*$/)) {
			await fetch(urlStream(config, queue[index].id, window.streamFormat, window.maxBitRate))
				.then(() => { queue[index].isDownloaded = true })
				.catch(() => { })
		}
	}
}

export const unloadSong = async () => { }

const loadSong = async (config, queue, index) => {
	const song = queue[index]
	const sound = audio()

	sound.src = urlStream(config, song.id, window.streamFormat, window.maxBitRate)
	sound.play()
		.then(() => {
			getApi(config, 'scrobble', `id=${song.id}&submission=false`)
				.catch(() => { })
		})
		.catch((error) => {
			console.error(error)
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
	songDispatch({ type: 'setSong', queue, index })
	setRepeat(songDispatch, 'next')
}

export const nextSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong()
		await loadSong(config, song.queue, (song.index + 1) % song.queue.length)
		songDispatch({ type: 'next' })
		if (song.actionEndOfSong === 'repeat') await setRepeat(songDispatch, 'next')
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong()
		await loadSong(config, song.queue, (song.queue.length + song.index - 1) % song.queue.length)
		songDispatch({ type: 'previous' })
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
	songdispatch({ type: 'setActionEndOfSong', action })
}

export const isVolumeSupported = () => {
	return window.isVolumeSupported
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

export const addToQueue = async (_config, songDispatch, track, index = null) => {
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
	State,
}