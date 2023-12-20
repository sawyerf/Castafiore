import { Audio } from 'expo-av';
import React from 'react';
import { getConfig } from './config';

// TODO: Solve Unhandle Promise Rejection Warning
export const SoundContext = React.createContext()

export const playSong = async (config, sound, songs, index) => {
	sound.songInfo = songs[index]
	sound.index = index
	await sound.unloadAsync()
	await sound.loadAsync(
		{ uri: `${config.url}/rest/download?id=${songs[index].id}&${config.query}` },
		{
			shouldPlay: true,
			staysActiveInBackground: true,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
		}
	)
	fetch('/lolipop/keepAppUp')
		.catch((error) => { })
	sound.songList = songs
}

export const nextSong = async (config, sound) => {
	if (sound.songList) {
		await playSong(config, sound, sound.songList, (sound.index + 1) % sound.songList.length)
	}
}

export const previousSong = async (config, sound) => {
	if (sound.songList) {
		await playSong(config, sound, sound.songList, (sound.songList.length + sound.index - 1) % sound.songList.length)
	}
}