import { Audio } from 'expo-av';

import { getApi, urlCover, urlStream } from './api';

export const handleAction = (config, song, songDispatch) => {
	song.sound.setOnPlaybackStatusUpdate((playbackStatus) => {
		songDispatch({ type: 'setPlaying', isPlaying: playbackStatus.isPlaying })
		if (playbackStatus.isLoaded) {
			songDispatch({
				type: 'setTime',
				position: playbackStatus.positionMillis / 1000,
				duration: playbackStatus.durationMillis / 1000,
			})
		}
		if (playbackStatus.didJustFinish) {
			const id = song.songInfo.id
			nextSong(config, song, songDispatch)
			getApi(config, 'scrobble', `id=${id}&submission=true`)
				.catch((error) => { })
		}
		if (playbackStatus.error) {
			console.error('onPlaybackStatus error', playbackStatus.error)
		}
	})
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
	getApi(config, 'scrobble', `id=${song.id}&submission=false`)
		.catch((error) => { })
	return sound
}

export const playSong = async (config, song, songDispatch, queue, index) => {
	unloadSong(song.sound)
	const sound = await loadSong(config, queue[index])
	songDispatch({ type: 'setSong', queue, index })
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

export const setPostion = async (sound, position) => {
	sound.setPositionAsync(position * 1000)
}