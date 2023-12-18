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
	// sound.songInfo.title = `${config.url}/rest/download?id=${songs[index].id}&${config.query}`
	// console.log(`${config.url}/rest/download?id=${songs[index].id}&${config.query}`)
	await sound.loadAsync(
		{ uri: `${config.url}/rest/download?id=${songs[index].id}&${config.query}`, title: songs[index].title },
		{ shouldPlay: true, staysActiveInBackground: true }
	)
	await sound.playAsync()
}

export const nextSong = async (sound) => {
	if (sound.songList) {
		const index = sound.songList.findIndex((song) => song.id === sound.songInfo.id)
		await playSong(sound, sound.songList, (index + 1) % sound.songList.length)
	}
}

export const pauseSong = async (sound) => {
	await sound.pauseAsync()
}