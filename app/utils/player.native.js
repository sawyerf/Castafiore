import { Audio } from 'expo-av';
import React from 'react';
import { Platform } from 'react-native';

import { getApi, urlCover, urlStream } from './api';
import { getSettings } from './settings';

export const SoundContext = React.createContext()

export const playSong = async (config, sound, songs, index) => {
	sound.songInfo = songs[index]
	sound.index = index
	await sound.unloadAsync()
	await sound.loadAsync(
		{ uri: await urlStream(config, songs[index].id) },
		{
			shouldPlay: true,
			staysActiveInBackground: true,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
		},
	)
	getApi(config, 'scrobble', `id=${sound.songInfo.id}&submission=false`)
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

export const pauseSong = async (sound) => {
	await sound.pauseAsync()
}

export const resumeSong = async (sound) => {
	await sound.playAsync()
}