// import { Audio } from 'expo-av';
import React from 'react';
import { Platform } from 'react-native';

import { getApi, urlCover, urlStream } from './api';
import { getSettings } from '~/contexts/settings';


export const initPlayer = async (songDispatch) => {
	const sound = new Audio()
	sound.addEventListener('loadedmetadata', () => {
		songDispatch({ type: 'setTime', position: 0, duration: sound.duration })
		sound.play()
	})
	sound.addEventListener('play', () => {
		songDispatch({ type: 'setPlaying', isPlaying: true })
	})
	sound.addEventListener('pause', () => {
		songDispatch({ type: 'setPlaying', isPlaying: false })
	})
	songDispatch({ type: 'setSound', sound })
}

export const handleAction = (config, song, songDispatch, setTime) => {
	if (!song.sound) return
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
	navigator.mediaSession.setActionHandler("pause", () => {
		pauseSong(song.sound)
	});
	navigator.mediaSession.setActionHandler("play", () => {
		resumeSong(song.sound)
	});
	navigator.mediaSession.setActionHandler("seekto", (details) => {
		setPosition(song.sound, details.seekTime)
	});

	const timeUpdateHandler = () => {
		if (!song.sound) return
		setTime({
			position: song.sound.currentTime,
			duration: song.sound.duration,
		})

	}
	const endedHandler = () => {
		const songId = song.songInfo.id

		if (song.actionEndOfSong === 'repeat') {
			setPosition(song.sound, 0)
			resumeSong(song.sound)
		} else {
			nextSong(config, song, songDispatch)
		}
		getApi(config, 'scrobble', `id=${songId}&submission=true`)
			.catch((error) => { })
	}

	song.sound.addEventListener('ended', endedHandler)
	song.sound.addEventListener('timeupdate', timeUpdateHandler)
	return () => {
		song.sound.removeEventListener('timeupdate', timeUpdateHandler)
		song.sound.removeEventListener('ended', endedHandler)
	}
}

const downloadNextSong = async (config, queue, currentIndex) => {
	const settings = await getSettings()
	const maxIndex = Math.min(settings.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (!queue[index].isDownloaded && queue[index].id.match(/^[a-z0-9]*$/)) {
			await fetch(await urlStream(config, queue[index].id))
				.then((_) => { queue[index].isDownloaded = true })
				.catch((_) => { })
		}
	}
}

export const unloadSong = async (sound) => { }

const loadSong = async (config, sound, queue, index, songDispatch) => {
	const song = queue[index]
	sound.src = await urlStream(config, song.id)
	// await sound.load()
	// await sound.play()
	navigator.mediaSession.metadata = new MediaMetadata({
		title: song.title,
		artist: song.artist,
		album: song.album,
		artwork: [{ src: urlCover(config, song.albumId) }],
	})
	getApi(config, 'scrobble', `id=${song.id}&submission=false`)
		.catch((error) => { })
}

export const playSong = async (config, song, songDispatch, queue, index) => {
	await loadSong(config, song.sound, queue, index, songDispatch)
	songDispatch({ type: 'setSong', queue, index })
	songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	downloadNextSong(config, queue, index)
}

export const nextSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong(song.sound)
		await loadSong(config, song.sound, song.queue, (song.index + 1) % song.queue.length, songDispatch)
		songDispatch({ type: 'next' })
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong(song.sound)
		await loadSong(config, song.sound, song.queue, (song.queue.length + song.index - 1) % song.queue.length, songDispatch)
		songDispatch({ type: 'previous' })
	}
}

export const pauseSong = async (sound) => {
	sound.pause()
}

export const resumeSong = async (sound) => {
	sound.play()
}

export const setPosition = async (sound, position) => {
	sound.currentTime = position
}

export const setVolume = async (sound, volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	if (sound) sound.volume = volume
}

export const secondToTime = (second) => {
	if (!second) return '00:00'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}
