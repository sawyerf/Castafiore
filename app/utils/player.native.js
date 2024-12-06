import { Audio } from 'expo-av';

import { getApi, urlCover, urlStream } from './api';

export const initPlayer = async (songDispatch) => {
	songDispatch({ type: 'setSound', sound: new Audio.Sound() })
}

export const handleAction = (config, song, songDispatch, setTime) => {
	song.sound.setOnPlaybackStatusUpdate((playbackStatus) => {
		// This function refresh to many time so it can cause performance issue
		songDispatch({ type: 'setPlaying', isPlaying: playbackStatus.isPlaying })
		if (playbackStatus.isLoaded) {
			setTime({
				position: playbackStatus.positionMillis / 1000,
				duration: playbackStatus.durationMillis / 1000,
			})
		}
		if (playbackStatus.didJustFinish) {
			const id = song.songInfo.id

			if (song.actionEndOfSong === 'repeat') {
				setPosition(song.sound, 0)
				resumeSong(song.sound)
			} else {
				nextSong(config, song, songDispatch)
			}
			getApi(config, 'scrobble', `id=${id}&submission=true`)
				.catch((error) => { })
		}
		if (playbackStatus.error) {
			console.error('onPlaybackStatus error', playbackStatus.error)
		}
	})
	return () => { }
}

export const unloadSong = async (sound) => {
	if (!sound) return
	if (sound._loaded) {
		await sound.unloadAsync()
	}
}

const loadSong = async (config, song, sound) => {
	await unloadSong(sound)
	await sound.loadAsync(
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
}

export const playSong = async (config, song, songDispatch, queue, index) => {
	await loadSong(config, queue[index], song.sound)
	songDispatch({ type: 'setSong', queue, index })
	songDispatch({ type: 'setActionEndOfSong', action: 'next' })
}

export const nextSong = async (config, song, songDispatch) => {
	if (song.queue) {
		await loadSong(config, song.queue[(song.index + 1) % song.queue.length], song.sound)
		songDispatch({ type: 'next' })
	}
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		await loadSong(config, song.queue[(song.queue.length + song.index - 1) % song.queue.length], song.sound)
		songDispatch({ type: 'previous' })
	}
}

export const pauseSong = async (sound) => {
	await sound.pauseAsync()
}

export const resumeSong = async (sound) => {
	await sound.playAsync()
}

export const setPosition = async (sound, position) => {
	await sound.setPositionAsync(position * 1000)
}

export const setVolume = async (sound, volume) => {
}

export const secondToTime = (second) => {
	if (!second) return '00:00'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}
