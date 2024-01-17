// import { Audio } from 'expo-av';
import React from 'react';
import { Platform } from 'react-native';

import { getApi, urlCover, urlStream } from './api';
import { getSettings } from '~/contexts/settings';


export const handleAction = (config, song, songDispatch) => {
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
}

const downloadNextSong = async (config, queue, currentIndex) => {
	const settings = await getSettings()
	const maxIndex = Math.min(settings.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (!queue[index].isDownloaded && queue[index].id.match(/^[a-z0-9]*$/)) {
			await urlStream(config, queue[index].id)
				.then((_) => {
					queue[index].isDownloaded = true
				})
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
	let sound = song.sound
	if (!sound) {
		sound = new Audio()
		sound.addEventListener('loadedmetadata', () => {
			songDispatch({ type: 'setTime', position: 0, duration: sound.duration })
			sound.play()
		})
		sound.addEventListener('timeupdate', () => {
			songDispatch({ type: 'setTime', position: sound.currentTime, duration: sound.duration })
		})
		sound.addEventListener('play', () => {
			songDispatch({ type: 'setPlaying', isPlaying: true })
		})
		sound.addEventListener('pause', () => {
			songDispatch({ type: 'setPlaying', isPlaying: false })
		})
		songDispatch({ type: 'setSound', sound })
	}

	await loadSong(config, sound, queue, index, songDispatch)
	songDispatch({ type: 'setSong', queue, index })
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