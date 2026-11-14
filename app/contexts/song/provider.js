import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform, AppState } from 'react-native'

import Player from '~/utils/player'
import logger from '~/utils/logger'
import State from '~/utils/playerState'
import { SongContext, SongDispatchContext } from '~/contexts/song/context'

export const SongProvider = ({ children }) => {
	const [song, dispatch] = React.useReducer(songReducer, defaultSong)

	React.useEffect(() => {
		if (!song.isInit) {
			if (Platform.OS === 'android') {
				const subscription = AppState.addEventListener('change', (appState) => {
					if (appState === 'active') {
						Player.initPlayer(dispatch)
						subscription.remove()
					}
				})
				return () => {
					subscription.remove()
				}
			} else {
				Player.initPlayer(dispatch)
			}
		}
	}, [])

	return (
		<SongDispatchContext.Provider value={dispatch}>
			<SongContext.Provider value={song}>
				{children}
			</SongContext.Provider>
		</SongDispatchContext.Provider>
	)
}

// Convert track Object to save cache space
const convertTrack = (track) => {
	return {
		id: track.id,
		title: track.title,
		artist: track.artist,
		artists: track.artists,
		artistId: track.artistId,
		album: track.album,
		albumId: track.albumId,
		duration: track.duration,
		covertArt: track.covertArt,
		track: track.track,
		starred: track.starred,
		userRating: track.userRating ?? track.rating ?? 0,
		size: track.size,
		index: track.index,
		mediaType: track.mediaType,
		// radio
		homePageUrl: track.homePageUrl,
		name: track.name,
		streamUrl: track.streamUrl,
	}
}

const newSong = (state, action, isCache = false) => {
	const song = {
		...state,
		...action,
	}
	global.song = song
	if (isCache) {
		AsyncStorage.setItem('song', JSON.stringify(song))
			.catch((error) => logger.error('newSong', 'Error saving song to AsyncStorage:', error))
	}
	return song
}

export const songReducer = (state, action) => {
	switch (action.type) {
		case 'init':
			return newSong(state, {
				isInit: true,
			})
		case 'restore':
			return newSong(state, {
				queue: action.song.queue || null,
				songInfo: action.song.songInfo || null,
				index: action.song.index || 0,
				actionEndOfSong: action.song.actionEndOfSong || 'next',
				randomIndex: action.song.randomIndex || [],
				isSongLoad: action.isSongLoad || false,
			})
		case 'setQueue': {
			const newQueue = action.queue.map((track) => convertTrack(track))
			return newSong(state, {
				songInfo: newQueue[action.index],
				index: action.index,
				queue: newQueue,
				isSongLoad: true,
			}, true)
		}
		case 'setIndex':
			if (!state.queue || state.queue?.length <= action.index) return state
			return newSong(state, {
				index: action.index,
				songInfo: state.queue[action.index],
			}, true)
		case 'setState': {
			if (action.state === state.state || !action.state) return state
			return newSong(state, {
				state: action.state,
			})
		}
		case 'addToQueue': {
			if (!state.songInfo || !state.queue) return state
			const newQueue = [...state.queue]
			const isAppend = action.index === null || action.index === undefined || action.index >= newQueue.length
			const position = isAppend ? newQueue.length : Math.max(action.index, 0)
			newQueue.splice(position, 0, action.track)

			// Shuffle order: shift the indexes after the inserted song.
			// "Play next" plays it right after the current song, "add to queue" at the end of the order.
			let randomIndex = []
			if (state.randomIndex?.length) {
				randomIndex = state.randomIndex.map((i) => i >= position ? i + 1 : i)
				const current = randomIndex.indexOf(state.index >= position && !isAppend ? state.index + 1 : state.index)
				if (isAppend || current === -1) randomIndex.push(position)
				else randomIndex.splice(current + 1, 0, position)
			}

			return newSong(state, {
				queue: newQueue,
				index: (!isAppend && state.index >= position) ? state.index + 1 : state.index,
				randomIndex,
			}, true)
		}
		case 'setRating': {
			if (!state.queue?.length) return state
			const newQueue = state.queue.map((track) => {
				if (track.id !== action.id) return track
				return {
					...track,
					userRating: action.rating,
					rating: action.rating,
				}
			})
			const songInfo = state.songInfo?.id === action.id ? {
				...state.songInfo,
				userRating: action.rating,
				rating: action.rating,
			} : state.songInfo
			return newSong(state, {
				queue: newQueue,
				songInfo,
			}, true)
		}
		case 'removeFromQueue': {
			if (!state.queue || state.queue.length <= action.index) return state
			const newQueue = [...state.queue]
			let newIndex = state.index

			newQueue.splice(action.index, 1)
			if (newIndex >= action.index) newIndex--
			if (newIndex < 0) newIndex = 0
			return newSong(state, {
				queue: newQueue,
				index: newIndex,
				songInfo: newQueue[newIndex] || null,
				randomIndex: (state.randomIndex || [])
					.filter((i) => i !== action.index)
					.map((i) => i > action.index ? i - 1 : i),
			}, true)
		}
		case 'setActionEndOfSong':
			if (['next', 'repeat', 'random'].indexOf(action.action) === -1) return state
			if (action.action === 'random') {
				if (state.queue?.length) {
					const allIndex = state.queue.map((_, index) => index)
					// generate list of random index
					const randomIndex = []
					while (randomIndex.length < state.queue.length) {
						const index = Math.floor(Math.random() * allIndex.length)
						randomIndex.push(allIndex[index])
						allIndex.splice(index, 1)
					}
					return newSong(state, {
						actionEndOfSong: action.action,
						randomIndex
					}, true)
				}
			}
			return newSong(state, {
				actionEndOfSong: action.action,
			}, true)
		case 'reset':
			return newSong(state, {
				...defaultSong,
				isInit: true,
				isSongLoad: false,
			}, true)
		default:
			logger.error('songReducer', 'Unknown action', action)
			return state
	}
}

export const defaultSong = {
	isInit: false,
	songInfo: null,
	queue: null,
	index: 0,
	actionEndOfSong: 'next',
	randomIndex: [],
	state: State.Stopped,
}
