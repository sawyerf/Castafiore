import React from 'react';
import { Platform } from 'react-native';

import { getApi, urlCover, urlStream } from './api';
import { getSettings } from '~/contexts/settings';

export const audio = () => {
	return document.getElementById('audio')
}

export const initPlayer = async (songDispatch) => {
	const sound = audio()
	songDispatch({ type: 'init' })
	sound.addEventListener('loadedmetadata', () => {
		console.log('loadedmetadata')
		audio().play()
	})
	sound.addEventListener('loadeddata', () => {
		console.log('loadeddata')
		audio().play()
	})
	sound.addEventListener('canplay', () => {
		console.log('canplay')
		audio().play()
	})
	sound.addEventListener('play', () => {
		songDispatch({ type: 'setPlaying', isPlaying: true })
	})
	sound.addEventListener('pause', () => {
		songDispatch({ type: 'setPlaying', isPlaying: false })
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
}

export const handleAction = (config, song, songDispatch, setTime) => {
	navigator.mediaSession.setActionHandler("previoustrack", () => {
		previousSong(config, song, songDispatch)
	});
	navigator.mediaSession.setActionHandler("nexttrack", () => {
		nextSong(config, song, songDispatch)
	});
	navigator.mediaSession.setActionHandler("seekbackward", () => {
		previousSong(config, song, songDispatch)
	});
	navigator.mediaSession.setActionHandler("seekforward", () => {
		nextSong(config, song, songDispatch)
	});

	const timeUpdateHandler = () => {
		setTime({
			position: audio().currentTime,
			duration: audio().duration,
		})
	}

	const endedHandler = () => {
		const songId = song.songInfo.id

		if (song.actionEndOfSong === 'repeat') {
			setPosition(0)
			resumeSong()
		} else {
			nextSong(config, song, songDispatch)
		}
		getApi(config, 'scrobble', `id=${songId}&submission=true`)
			.catch((error) => { })
	}

	const sound = audio()
	sound.addEventListener('ended', endedHandler)
	sound.addEventListener('timeupdate', timeUpdateHandler)
	return () => {
		sound.removeEventListener('timeupdate', timeUpdateHandler)
		sound.removeEventListener('ended', endedHandler)
	}
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
	songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	downloadNextSong(config, queue, index)
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
	if (position < 0) position = 0
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

export const secondToTime = (second) => {
	if (!second) return '00:00'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}
