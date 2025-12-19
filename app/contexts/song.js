import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import Player from '~/utils/player'
import logger from '~/utils/logger'

export const SongContext = React.createContext()
export const SongDispatchContext = React.createContext()

export const useSong = () => React.useContext(SongContext)
export const useSongDispatch = () => React.useContext(SongDispatchContext)

export const SongProvider = ({ children }) => {
	const [song, dispatch] = React.useReducer(songReducer, defaultSong)
	Player.useEvent(song, dispatch)

	React.useEffect(() => {
		if (!song.isInit) Player.initPlayer(dispatch)
	}, [])

	return (
		<SongDispatchContext.Provider value={dispatch}>
			<SongContext.Provider value={song}>
				{children}
			</SongContext.Provider>
		</SongDispatchContext.Provider>
	)
}

const newSong = (state, action, isCache = false) => {
	const song = {
		...state,
		...action,
	}
	global.song = song
	if (isCache && Platform.OS === 'android') {
		AsyncStorage.setItem('song', JSON.stringify(song))
			.catch((error) => logger.error('newSong', 'Error saving song to AsyncStorage:', error))
	}
	return song
}

export const songReducer = (state, action) => {
	switch (action.type) {
		case 'init':
			if (action.song) return newSong(state, {
				queue: action.song.queue || null,
				songInfo: action.song.songInfo || null,
				index: action.song.index || 0,
				actionEndOfSong: action.song.actionEndOfSong || 'next',
				randomIndex: action.song.randomIndex || [],
				isInit: true,
			})
			return newSong(state, {
				isInit: true,
			})
		case 'setQueue':
			return newSong(state, {
				songInfo: action.queue[action.index],
				index: action.index,
				queue: action.queue,
			}, true)
		case 'setIndex':
			if (!state.queue || state.queue?.length <= action.index) return state
			return newSong(state, {
				index: action.index,
				songInfo: state.queue[action.index],
			}, true)
		case 'setPlaying': {
			if (action.state === state.state || !action.state) return state
			return newSong(state, {
				state: action.state,
			})
		}
		case 'addToQueue': {
			if (!state.songInfo || !state.queue) return state
			const newQueue = [...state.queue]
			if (action.index === null || action.index >= newQueue.length) {
				newQueue.push(action.track)
			} else {
				newQueue.splice(action.index, 0, action.track)
			}

			return newSong(state, {
				queue: newQueue,
				index: (typeof action.index === 'number' && state.index >= action.index) ? state.index + 1 : state.index,
				randomIndex: state.randomIndex?.length ? [...state.randomIndex, newQueue.length - 1] : [],
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
				randomIndex: state.randomIndex.filter((i) => i < newQueue.length),
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
	state: 'stopped'
}