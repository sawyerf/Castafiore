import { Audio } from 'expo-av';
import React from 'react';

export const SoundContext = React.createContext(new Audio.Sound())
export const SongContext = React.createContext()

export const songReducer = (state, action) => {
	switch (action.type) {
		case 'setSound':
			return {
				...state,
				sound: action.sound,
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
		case 'setTime':
			return {
				...state,
				position: action.position,
				duration: action.duration,
			}
		case 'addQueue':
			if (!state.sound || !state.songInfo || !state.queue.length || !action.queue.length) return state
			return {
				...state,
				queue: [...state.queue, ...action.queue],
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
	// Time
	position: 0,
	duration: 0,
}