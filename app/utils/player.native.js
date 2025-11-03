import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode, State, useProgress, Event, useTrackPlayerEvents } from 'react-native-track-player';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { urlCover, urlStream } from '~/utils/api';
import { isSongCached, getPathSong, deleteOldCacheSongs } from '~/utils/cache';
import { nextRandomIndex, prevRandomIndex } from '~/utils/tools';
import logger from '~/utils/logger';

export const initService = async () => {
	TrackPlayer.registerPlaybackService(() => require('~/services/servicePlayback'));
}

export const initPlayer = async (songDispatch) => {
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
	songDispatch({ type: 'setPlaying', state })
}

export const useEvent = (song, songDispatch) => {
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
				if (global.song.index != undefined && song.index != global.song.index) {
					songDispatch({ type: 'setIndex', index: global.song.index })
				}
			}
		})
}

export const previousSong = async (config, song, songDispatch) => {
	if (song.queue) {
		if (song.actionEndOfSong === 'random') await setIndex(config, songDispatch, song.queue, prevRandomIndex())
		else await setIndex(config, songDispatch, song.queue, (song.queue.length + song.index - 1) % song.queue.length)
		if (song.actionEndOfSong === 'repeat') await setRepeat(songDispatch, 'next')
	}
}

export const nextSong = async (config, song, songDispatch) => {
	if (song.queue) {
		if (song.actionEndOfSong === 'random') await setIndex(config, songDispatch, song.queue, nextRandomIndex())
		else await setIndex(config, songDispatch, song.queue, (song.index + 1) % song.queue.length)
		if (song.actionEndOfSong === 'repeat') await setRepeat(songDispatch, 'next')
	}
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

export const downloadSong = async (urlStream, id) => {
	if (global.songsDownloading.indexOf(id) >= 0) return urlStream
	const fileUri = getPathSong(id, global.streamFormat)
	const partUri = `${fileUri}.part`

	if (await isSongCached(null, id, global.streamFormat, global.maxBitRate)) return fileUri
	if (global.enableMaxCacheSize && global.sizeCacheSong >= global.maxCacheSize * 1024 * 1024 * 1024) {
		logger.info('downloadSong', 'Max cache size reached, skipping download')
		return urlStream
	}
	global.songsDownloading.push(id)
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
			global.sizeCacheSong += realSize
			return fileUri
		}
	} catch (error) {
		logger.error('downloadSong', error)
		return await returnFail(partUri, urlStream, id)
	}
}

export const downloadNextSong = async (queue, currentIndex) => {
	if (!global.isSongCaching) return
	const maxIndex = Math.min(global.cacheNextSong, queue.length)

	if (global.enableMaxCacheSize && global.sizeCacheSong >= global.maxCacheSize * 1024 * 1024 * 1024) {
		logger.info('downloadNextSong', 'Max cache size reached, deleting old cached songs')
		await deleteOldCacheSongs()
	}
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

export const playSong = async (config, songDispatch, queue, index) => {
	loadSong(config, queue, index)
	songDispatch({ type: 'setQueue', queue, index })
	setRepeat(songDispatch, 'next')
}

export const secondToTime = (second) => {
	if (!second) return '00:00'
	if (second === Infinity) return '∞:∞'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const setPosition = async (position) => {
	if (position < 0 || !position) position = 0
	if (position === Infinity) return

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
	TrackPlayer.setRepeatMode(RepeatMode.Off)
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
		songDispatch({ type: 'setQueue', queue, index: 0 })
		setRepeat(songDispatch, 'next')
	}
}

export const setIndex = async (config, songDispatch, queue, index) => {
	if (queue && index >= 0 && index < queue.length) {
		loadSong(config, queue, index)
		songDispatch({ type: 'setIndex', index })
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

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

export const addToQueue = async (config, songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
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
	removeFromQueue,
	addToQueue,
	setIndex,
	State,
}