import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode, State, useProgress, Event, useTrackPlayerEvents } from 'react-native-track-player';
import { urlCover, urlStream } from '~/utils/api';
import * as FileSystem from 'expo-file-system';

export const initService = async () => {
	TrackPlayer.registerPlaybackService(() => require('~/services/servicePlayback'));
}

export const initPlayer = async (songDispatch) => {
	songDispatch({ type: 'init' })
	await TrackPlayer.setupPlayer()
		.catch((error) => {
			console.error('initPlayer: ', error)
		})
	await TrackPlayer.updateOptions({
		android: {
			appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
			alwaysPauseOnInterruption: true,
		},
		capabilities: [
			Capability.Play,
			Capability.Pause,
			Capability.SkipToNext,
			Capability.SkipToPrevious,
			Capability.SeekTo
		],
		notificationCapabilities: [
			Capability.Play,
			Capability.Pause,
			Capability.SkipToNext,
			Capability.SkipToPrevious,
			Capability.SeekTo
		],
		progressUpdateEventInterval: -1,
		icon: require('~/../assets/icon.png')
	})
	// Set the player to the current song
	const queue = await TrackPlayer.getQueue()
	if (queue.length > 0) {
		const index = await TrackPlayer.getActiveTrackIndex()
		const state = (await TrackPlayer.getPlaybackState()).state

		songDispatch({ type: 'setPlaying', state })
		songDispatch({ type: 'setSong', queue, index })
	} else {
		setRepeat(songDispatch, 'next')
	}
}

export const useEvent = (songDispatch) => {
	// Catch player events
	useTrackPlayerEvents(
		[
			Event.PlaybackState,
			Event.PlaybackActiveTrackChanged,
		],
		async (event) => {
			if (event.type === Event.PlaybackState) {
				songDispatch({ type: 'setPlaying', state: event.state })
			} else if (event.type === Event.PlaybackActiveTrackChanged) {
				songDispatch({ type: 'setIndex', index: event.index })
			}
		})
}

export const previousSong = async (config, song, songDispatch) => {
	await TrackPlayer.skipToPrevious()
	songDispatch({ type: 'previous' })
}

export const nextSong = async (config, song, songDispatch) => {
	await TrackPlayer.skipToNext()
	songDispatch({ type: 'next' })
}

export const reload = async () => {
	await TrackPlayer.retry()
}

export const pauseSong = async () => {
	await TrackPlayer.pause()
}

export const resumeSong = async () => {
	await TrackPlayer.play()
}

export const stopSong = async () => {
	await TrackPlayer.stop()
}

const downloadSong = async (urlStream, id) => {
	const fileUri = FileSystem.documentDirectory + id + '.' + global.streamFormat

	console.log(fileUri)
	if ((await FileSystem.getInfoAsync(fileUri)).exists) return fileUri
	try {
		await FileSystem.downloadAsync(urlStream, fileUri)
		return fileUri
	} catch (error) {
		console.error('downloadSong: ', error)
		return urlStream
	}
}

const downloadNextSong = async (queue, currentIndex) => {
	const maxIndex = Math.min(global.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (currentIndex !== index && queue[index].url.startsWith('http')) {
			const fileUri = await downloadSong(queue[index].url, queue[index].id)
			// updateMetadataForTrack not working with url
			await TrackPlayer.updateMetadataForTrack(index, {
				...queue[index],
				url: fileUri,
			})
		}
	}
}

export const playSong = async (config, songDispatch, queue, index) => {
	const fileUri = downloadSong(
		urlStream(config, queue[index].id, global.streamFormat, global.maxBitRate),
		queue[index].id)

	let tracks = queue.map(async (track, indexTrack) => {
		return {
			...track,
			id: track.id,
			url: indexTrack === index ? await fileUri : urlStream(config, track.id, global.streamFormat, global.maxBitRate),
			atwork: urlCover(config, track),
			artist: track.artist,
			title: track.title,
			album: track.album,
			description: '',
			date: '',
			genre: '',
			rating: false,
			duration: track.duration,
			type: 'default',
			isLiveStream: false,
			config
		}
	})
	tracks = await Promise.all(tracks)
	await TrackPlayer.setQueue(tracks)
	await TrackPlayer.skip(index)
	await TrackPlayer.play()
	songDispatch({ type: 'setSong', queue, index })
	setRepeat(songDispatch, 'next')
	await downloadNextSong(tracks, index)
}

export const secondToTime = (second) => {
	if (!second) return '00:00'
	if (second === Infinity) return '∞:∞'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const setPosition = async (position) => {
	await TrackPlayer.seekTo(position)
}

export const setVolume = async (volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	await TrackPlayer.setVolume(volume)
}

export const getVolume = () => {
	return TrackPlayer.getVolume()
}

export const setRepeat = async (songdispatch, action) => {
	songdispatch({ type: 'setActionEndOfSong', action })
	TrackPlayer.setRepeatMode(action === 'repeat' ? RepeatMode.Track : RepeatMode.Queue)
}

export const unloadSong = async () => { }
export const tuktuktuk = async (songDispatch) => {
	const urlTuk = 'https://sawyerf.github.io/tuktuktuk.mp3'
	const playingState = await TrackPlayer.getPlaybackState()

	if ([State.Paused, State.Ended, State.Stopped, State.None].indexOf(playingState.state) > -1) {
		const queue = [{
			id: 'tuktuktuk',
			albumId: 'tuktuktuk',
			url: urlTuk,
			title: 'Tuk Tuk Tuk',
			album: 'Tuk Tuk Tuk',
			artist: 'Sawyerf',
			artwork: require('~/../assets/icon.png')
		},
		{
			id: 'tuktuktukend',
			albumId: 'tuktuktuk',
			url: urlTuk,
			title: 'Tuk Tuk Tuk',
			artist: 'Sawyerf',
			artwork: require('~/../assets/foreground-icon.png')
		}]
		await TrackPlayer.setQueue(queue)
		await TrackPlayer.play()
		songDispatch({ type: 'setSong', queue, index: 0 })
		setRepeat(songDispatch, 'next')
	}
}

export const updateVolume = () => { }
export const updateTime = () => {
	return useProgress(500)
}

export const isVolumeSupported = () => {
	return false
}

export const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	TrackPlayer.reset()
}

export default {
	initService,
	initPlayer,
	previousSong,
	nextSong,
	pauseSong,
	resumeSong,
	stopSong,
	playSong,
	secondToTime,
	setPosition,
	setVolume,
	getVolume,
	setRepeat,
	unloadSong,
	tuktuktuk,
	updateVolume,
	updateTime,
	isVolumeSupported,
	reload,
	useEvent,
	resetAudio,
	State,
}