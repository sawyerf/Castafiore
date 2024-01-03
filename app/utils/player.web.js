import { Audio } from 'expo-av';
import React from 'react';
import { Platform } from 'react-native';

import { getApi, urlCover, urlStream } from './api';
import { getSettings } from '~/contexts/settings';

export const handleAction = (config, song, songDispatch) => {
	navigator.mediaSession.setActionHandler("pause", () => {
		pauseSong(song.sound)
	});
	navigator.mediaSession.setActionHandler("play", () => {
		pauseSong(song.sound)
	});
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
}

const downloadNextSong = async (config, queue, currentIndex) => {
	const settings = await getSettings()
	const maxIndex = Math.min(settings.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (!queue[index].isDownloaded) {
			await urlStream(config, queue[index].id)
				.then((_) => {
					queue[index].isDownloaded = true
				})
				.catch((_) => { })
		}
	}
}

export const unloadSong = async (sound) => {
	if (!sound) return
	if (sound._loaded) {
		await sound.unloadAsync()
	} else {
		sound.setOnPlaybackStatusUpdate((status) => {
			if (status.isLoaded) sound.unloadAsync()
		})
	}
}

const loadSong = async (config, song) => {
	const { sound } = await Audio.Sound.createAsync(
		{ uri: await urlStream(config, song.id) },
		{
			shouldPlay: true,
			staysActiveInBackground: true,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
		},
	)
	navigator.mediaSession.metadata = new MediaMetadata({
		title: song.title,
		artist: song.artist,
		album: song.album,
		artwork: [{ src: urlCover(config, song.albumId) }],
	})
	getApi(config, 'scrobble', `id=${song.id}&submission=false`)
		.catch((error) => { })
	return sound
}

export const playSong = async (config, song, songDispatch, queue, index) => {
	unloadSong(song.sound)
	const sound = await loadSong(config, queue[index])
	songDispatch({ type: 'setSong', queue, index })
	songDispatch({ type: 'setSound', sound })
	downloadNextSong(config, queue, index)
}

export const nextSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong(song.sound)
		const sound = await loadSong(config, song.queue[(song.index + 1) % song.queue.length])
		songDispatch({ type: 'next' })
		songDispatch({ type: 'setSound', sound })
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong(song.sound)
		const sound = await loadSong(config, song.queue[(song.queue.length + song.index - 1) % song.queue.length])
		songDispatch({ type: 'previous' })
		songDispatch({ type: 'setSound', sound })
	}
}

export const pauseSong = async (sound) => {
	await sound.pauseAsync()
}

export const resumeSong = async (sound) => {
	await sound.playAsync()
}