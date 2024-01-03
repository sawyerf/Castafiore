import { Audio } from 'expo-av';

import { getApi, urlCover, urlStream } from './api';

export const handleAction = (config, sound) => { }

export const unloadSong = async (sound) => {
	if (sound) await sound.unloadAsync()
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
	getApi(config, 'scrobble', `id=${song.id}&submission=false`)
		.catch((error) => { })
	return sound
}

export const playSong = async (config, song, songDispatch, songs, index) => {
	unloadSong(song.sound)
	const sound = await loadSong(config, songs[index])
	songDispatch({ type: 'setSong', queue: songs, index })
	songDispatch({ type: 'setSound', sound })
}

export const nextSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong(song.sound)
		const sound = await loadSong(config, song.queue[(song.index + 1) % song.queue.length])
		songDispatch({ type: 'previous' })
		songDispatch({ type: 'setSound', sound })
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		unloadSong(song.sound)
		const sound = await loadSong(config, song.queue[(song.queue.length + song.index - 1) % song.queue.length])
		songDispatch({ type: 'next' })
		songDispatch({ type: 'setSound', sound })
	}
}

export const pauseSong = async (sound) => {
	await sound.pauseAsync()
}

export const resumeSong = async (sound) => {
	await sound.playAsync()
}