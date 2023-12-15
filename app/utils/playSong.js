import { Audio } from 'expo-av';
import React from 'react';
import { getConfig } from './config';

// TODO: Solve Unhandle Promise Rejection Warning
export const SoundContext = React.createContext()

export const playSong = async (sound, songs, index) => {
	const config = await getConfig()

	sound.songInfo = songs[index]
	sound.songList = songs
	await sound.unloadAsync()
	await sound.loadAsync(
		{ uri: `${config.url}/rest/download?id=${songs[index].id}&${config.query}` },
		{ shouldPlay: true, staysActiveInBackground: true }
	)
	sound.playAsync()
}

export const nextSong = async (sound) => {
	if (sound.songList) {
		const index = sound.songList.findIndex((song) => song.id === sound.songInfo.id)
		if (index < sound.songList.length - 1) {
			await playSong(sound, sound.songList, index + 1)
		}
	}
}

export const pauseSong = async (sound) => {
	await sound.pauseAsync()
}