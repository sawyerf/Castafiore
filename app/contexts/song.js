import React from 'react';

export const SongContext = React.createContext()

export const songReducer = (state, action) => {
	switch (action.type) {
		case 'init':
			return {
				...state,
				isInit: true,
			}
		case 'setSong':
			return {
				...state,
				songInfo: action.queue[action.index],
				index: action.index,
				queue: action.queue,
			}
		case 'next':
			const nextIndex = (state.index + 1) % state.queue.length
			return {
				...state,
				index: nextIndex,
				songInfo: state.queue[nextIndex],
			}
		case 'previous':
			const previousIndex = (state.queue.length + state.index - 1) % state.queue.length
			return {
				...state,
				index: previousIndex,
				songInfo: state.queue[previousIndex],
			}
		case 'setPlaying':
			if (action.isPlaying === state.isPlaying) return state
			return {
				...state,
				isPlaying: action.isPlaying,
			}
		case 'addQueue':
			if (!state.sound || !state.songInfo || !state.queue.length || !action.queue.length) return state
			return {
				...state,
				queue: [...state.queue, ...action.queue],
			}
		case 'setActionEndOfSong':
			if (['next', 'repeat'].indexOf(action.action) === -1) return state
			return {
				...state,
				actionEndOfSong: action.action,
			}
		default:
			console.error('Unknown action', action)
			return state
	}
}

export const defaultSong = {
	sound: null,
	songInfo: null,
	queue: null,
	index: 0,
	isPlaying: false,
	actionEndOfSong: 'next',
	// Time
	position: 0,
	duration: 0,
}