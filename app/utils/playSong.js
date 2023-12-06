import { Audio } from 'expo-av';
import React from 'react';

// TODO: Solve Unhandle Promise Rejection Warning
export const SoundContext = React.createContext()

export const playSong = async (sound, streamUrl) => {
	await sound.unloadAsync()
	await sound.loadAsync(
		{ uri: streamUrl },
		{ shouldPlay: true, staysActiveInBackground: true }
	)
	sound.playAsync()
}

export const pauseSong = async (sound) => {
	await sound.pauseAsync()
}