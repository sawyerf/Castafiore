import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode, State, useProgress, Event, useTrackPlayerEvents } from 'react-native-track-player'
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { urlCover, urlStream } from '~/utils/url'
import { isSongCached, getPathSong } from '~/utils/cache'
import MyState from '~/utils/playerState'
import logger from '~/utils/logger'

let isConnected = true

const initService = async () => {
	TrackPlayer.registerPlaybackService(() => require('~/services/servicePlayback'))
}

const convertState = (state) => {
	if (state === State.Playing) return MyState.Playing
	else if (state === State.Paused) return MyState.Paused
	else if (state === State.Stopped || state === State.None) return MyState.Stopped
	else if (state === State.Buffering) return MyState.Loading
	else if (state === State.Ready) return MyState.Paused
	else if (state === State.Error) return MyState.Error
	else return MyState.Stopped
}

const initPlayer = async (songDispatch) => {
	const song = await AsyncStorage.getItem('song')
		.then((song) => song ? JSON.parse(song) : null)
	songDispatch({ type: 'init' })
	await TrackPlayer.setupPlayer()
		.catch((error) => {
			logger.error('initPlayer', error)
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
	const activeTrack = await TrackPlayer.getActiveTrack()
	if (activeTrack) songDispatch({ type: 'init', song: song })
	TrackPlayer.setRepeatMode(RepeatMode.Off)
	const state = (await TrackPlayer.getPlaybackState()).state
	songDispatch({ type: 'setPlaying', state: convertState(state) })
}

const useEvent = (song, songDispatch, _nextSong) => {
	// Catch player events
	useTrackPlayerEvents(
		[
			Event.PlaybackState,
			Event.PlaybackActiveTrackChanged,
		],
		async (event) => {
			if (!isConnected) return
			if (event.type === Event.PlaybackState) {
				songDispatch({ type: 'setPlaying', state: convertState(event.state) })
			} else if (event.type === Event.PlaybackActiveTrackChanged) {
				if (global.song.index != undefined && song.index != global.song.index) {
					songDispatch({ type: 'setIndex', index: global.song.index })
				}
			}
		})
}

const reload = async () => {
	await TrackPlayer.retry()
}

const pauseSong = async () => {
	await TrackPlayer.pause()
}

const resumeSong = async () => {
	await TrackPlayer.play()
}

const stopSong = async () => {
	await TrackPlayer.stop()
}

const getHeader = (headers, key) => {
	if (!headers || !key) return null
	const header = Object.keys(headers).find(h => h.toLowerCase() === key.toLowerCase())
	return header ? headers[header] : null
}

const returnFail = async (partUri, urlStream, id) => {
	global.songsDownloading = global.songsDownloading.filter(songId => songId !== id)
	await FileSystem.deleteAsync(partUri)
	return urlStream
}

const downloadSong = async (urlStream, id) => {
	if (global.songsDownloading.indexOf(id) >= 0) return urlStream
	const fileUri = getPathSong(id, global.streamFormat)
	const partUri = `${fileUri}.part`
	global.songsDownloading.push(id)

	if (await isSongCached(null, id, global.streamFormat, global.maxBitRate)) return fileUri
	try {
		const res = await FileSystem.downloadAsync(urlStream, partUri)
		const contentType = getHeader(res?.headers, 'content-type')
		const contentLength = parseInt(getHeader(res?.headers, 'content-length'), 10)
		const realSize = await FileSystem.getInfoAsync(partUri).then(info => info.size)

		if (res?.status !== 200) {
			logger.error('downloadSong', `Error downloading song, status not 200 (${res?.status})`)
			return await returnFail(partUri, urlStream, id)
		} else if (!contentType?.includes('audio')) {
			logger.error('downloadSong', `Error downloading song, content-type not audio (${contentType})`)
			return await returnFail(partUri, urlStream, id)
		} else if ((!isNaN(contentLength) && realSize !== contentLength) || realSize === 0) {
			logger.error('downloadSong', `Error downloading song, size mismatch (real: ${realSize} / content-length: ${contentLength})`)
			return await returnFail(partUri, urlStream, id)
		} else {
			await FileSystem.moveAsync({ from: partUri, to: fileUri })
			global.listCacheSong.push(`${id}.${global.streamFormat}`)
			return fileUri
		}
	} catch (error) {
		logger.error('downloadSong', error)
		return await returnFail(partUri, urlStream, id)
	}
}

const downloadNextSong = async (queue, currentIndex) => {
	if (!global.isSongCaching) return
	const maxIndex = Math.min(global.cacheNextSong, queue.length)

	for (let i = -1; i < maxIndex; i++) {
		const index = (currentIndex + queue.length + i) % queue.length
		if (!queue[index].isLiveStream && queue[index].id.match(/^[a-zA-Z0-9-]*$/)) {
			await downloadSong(urlStream(global.config, queue[index].id, global.streamFormat, global.maxBitRate), queue[index].id)
		}
	}
}

const convertToTrack = async (track, config) => {
	return {
		...track,
		id: track.id,
		url: (await isSongCached(null, track.id, global.streamFormat, global.maxBitRate)) ?
			getPathSong(track.id, global.streamFormat) :
			urlStream(config, track.id, global.streamFormat, global.maxBitRate),
		artwork: urlCover(config, track),
		artist: track.artist,
		title: track.title,
		album: track.album,
		description: '',
		date: '',
		genre: '',
		rating: false,
		duration: track.duration,
		type: 'default',
		isLiveStream: track.type === 'radio',
	}
}

const loadSong = async (config, queue, index) => {
	await TrackPlayer.load(await convertToTrack(queue[index], config))
	await TrackPlayer.play()
}

const setPosition = async (position) => {
	if (position < 0 || !position) position = 0
	if (position === Infinity) return

	await TrackPlayer.seekTo(position)
}

const setVolume = async (volume) => {
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	await TrackPlayer.setVolume(volume)
}

const getVolume = () => {
	return TrackPlayer.getVolume()
}

const unloadSong = async () => { }
const tuktuktuk = async (songDispatch) => {
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
		songDispatch({ type: 'setQueue', queue, index: 0 })
		songDispatch({ type: 'setActionEndOfSong', action: 'next' })
	}
}

const updateVolume = () => { }
const updateTime = () => {
	return useProgress(500)
}

const isVolumeSupported = () => {
	return false
}

const resetAudio = (songDispatch) => {
	songDispatch({ type: 'reset' })
	TrackPlayer.reset()
}

const saveState = async () => {
	const progress = await TrackPlayer.getProgress()
	const state = await TrackPlayer.getPlaybackState()
	return {
		position: progress.position || 0,
		isPlaying: state.state === State.Playing
	}
}

const connect = async (_device) => {
	isConnected = true
}

const disconnect = async (_device) => {
	isConnected = false
}

export default {
	initService,
	initPlayer,
	pauseSong,
	resumeSong,
	stopSong,
	setPosition,
	setVolume,
	getVolume,
	unloadSong,
	loadSong,
	tuktuktuk,
	updateVolume,
	updateTime,
	isVolumeSupported,
	reload,
	useEvent,
	resetAudio,
	saveState,
	downloadNextSong,
	downloadSong,
	connect,
	disconnect,
}