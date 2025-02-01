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
		case 'addQueue':
			if (!state.songInfo || !state.queue.length || !action.queue.length) return state
			return newSong(state, {
				queue: [...state.queue, ...action.queue],
			})
		case 'setActionEndOfSong':
			if (['next', 'repeat'].indexOf(action.action) === -1) return state
			return newSong(state, {
				actionEndOfSong: action.action,
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