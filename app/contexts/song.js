import React from 'react';
import Player from '~/utils/player';

export const SongContext = React.createContext()
export const SongDispatchContext = React.createContext()

const newSong = (state, action) => {
	const song = {
		...state,
		...action,
	}
	if (window) window.song = song
	return song
}

export const songReducer = (state, action) => {
	switch (action.type) {
		case 'init':
			return newSong(state, {
				isInit: true,
			})
		case 'setSong':
			return newSong(state, {
				songInfo: action.queue[action.index],
				index: action.index,
				queue: action.queue,
			})
		case 'resetQueue':
			return newSong(state, {
				queue: null,
				index: 0,
				songInfo: null,
			})
		case 'setIndex':
			if (!state.queue || state.queue?.length <= action.index) return state
			return newSong(state, {
				index: action.index,
				songInfo: state.queue[action.index],
			})
		case 'next': {
			const nextIndex = (state.index + 1) % state.queue.length
			return newSong(state, {
				index: nextIndex,
				songInfo: state.queue[nextIndex],
			})
		}
		case 'previous': {
			const previousIndex = (state.queue.length + state.index - 1) % state.queue.length
			return newSong(state, {
				index: previousIndex,
				songInfo: state.queue[previousIndex],
			})
		}
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
			})
		}
		case 'setActionEndOfSong':
			if (['next', 'repeat', 'random'].indexOf(action.action) === -1) return state
			if (action.action === 'random') {
				if (state.queue?.length) {
					const allIndex = state.queue.map((_, index) => index);
					// generate list of random index
					const randomIndex = []
					while (randomIndex.length < state.queue.length) {
						const index = Math.floor(Math.random() * allIndex.length);
						randomIndex.push(allIndex[index]);
						allIndex.splice(index, 1);
					}
					return newSong(state, {
						actionEndOfSong: action.action,
						randomIndex
					})
				}
			}
			return newSong(state, {
				actionEndOfSong: action.action,
			})
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
			})
		}
		case 'reset':
			return newSong(state, {
				...defaultSong,
				isInit: true,
			})
		default:
			console.error('Unknown action', action)
			return state
	}
}

export const defaultSong = {
	isInit: false,
	songInfo: null,
	queue: null,
	index: 0,
	actionEndOfSong: 'next',
	state: Player.State.Stopped,
}