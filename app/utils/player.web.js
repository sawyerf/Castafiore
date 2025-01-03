import React from 'react';
import * as serviceWorkerRegistration from '~/services/serviceWorkerRegistration';

import { getApi, urlCover, urlStream } from './api';
import { getSettings } from '~/contexts/settings';

const audio = () => {
	return document.getElementById('audio')
}

export const initService = async () => {
	serviceWorkerRegistration.register();
}

export const initPlayer = async (songDispatch) => {
	const sound = audio()
	songDispatch({ type: 'init' })
	sound.addEventListener('loadedmetadata', () => {
		audio().play()
	})
	sound.addEventListener('loadeddata', () => {
		audio().play()
	})
	sound.addEventListener('play', () => {
		songDispatch({ type: 'setPlaying', isPlaying: true })
	})
	sound.addEventListener('pause', () => {
		songDispatch({ type: 'setPlaying', isPlaying: false })
	})
	sound.addEventListener('ended', () => {
		const songId = song.songInfo.id

		if (window.song.actionEndOfSong === 'repeat') {
			setPosition(0)
			resumeSong()
		} else {
			nextSong(window.config, window.song, songDispatch)
		}
		getApi(window.config, 'scrobble', `id=${songId}&submission=true`)
			.catch((error) => { })
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
		if (e.code === 'Space') {
			if (window.song.isPlaying) pauseSong()
			else resumeSong()
		} else if (e.code === 'ArrowRight') nextSong(window.config, window.song, songDispatch)
		else if (e.code === 'ArrowLeft') previousSong(window.config, window.song, songDispatch)
		else if (e.code === 'ArrowUp') setVolume(getVolume() + 0.1)
		else if (e.code === 'ArrowDown') setVolume(getVolume() - 0.1)
	})
}

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
	const settings = await getSettings()
	const maxIndex = Math.min(settings.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (!queue[index].isDownloaded && queue[index].id.match(/^[a-z0-9]*$/)) {
			await fetch(urlStream(config, queue[index].id))
				.then((_) => { queue[index].isDownloaded = true })
				.catch((_) => { })
		}
	}
}

export const unloadSong = async () => { }

const loadSong = async (config, queue, index) => {
	const song = queue[index]
	const sound = audio()

	sound.src = urlStream(config, song.id)
	sound.play()
		.catch((error) => {
			console.error(error)
		})
	navigator.mediaSession.metadata = new MediaMetadata({
		title: song.title,
		artist: song.artist,
		album: song.album,
		artwork: [{ src: urlCover(config, song.albumId) }],
	})
	getApi(config, 'scrobble', `id=${song.id}&submission=false`)
		.catch((error) => { })
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
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong()
		await loadSong(config, song.queue, (song.queue.length + song.index - 1) % song.queue.length)
		songDispatch({ type: 'previous' })
	}
}

export const pauseSong = async () => {
	audio().pause()
}

export const resumeSong = async () => {
	audio().play()
}

export const setPosition = async (position) => {
	const sound = audio()

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
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const tuktuktuk = (songDispatch) => {
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