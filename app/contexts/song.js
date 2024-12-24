import React from 'react';

export const SongContext = React.createContext()

const newSong = (state, action) => {
	const song = {
		...state,
		...action,
	}
	window.song = song
	return song
}

export const songReducer = (state, action) => {
	window.index = (window.index || 0) + 1
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
		case 'next':
			const nextIndex = (state.index + 1) % state.queue.length
			return newSong(state, {
				index: nextIndex,
				songInfo: state.queue[nextIndex],
			})
		case 'previous':
			const previousIndex = (state.queue.length + state.index - 1) % state.queue.length
			return newSong(state, {
				index: previousIndex,
				songInfo: state.queue[previousIndex],
			})
		case 'setPlaying':
			if (action.isPlaying === state.isPlaying) return state
			return newSong(state, {
				isPlaying: action.isPlaying,
			})
		case 'addQueue':
			if (!state.sound || !state.songInfo || !state.queue.length || !action.queue.length) return state
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