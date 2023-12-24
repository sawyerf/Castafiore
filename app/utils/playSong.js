import { Audio } from 'expo-av';
import React from 'react';
import { getConfig } from './config';
import { getApi, urlCover, urlStream } from './api';
import { Platform } from 'react-native';
import { settings } from './settings';

export const SoundContext = React.createContext()

const downloadNextSong = async (config, sound) => {
	for (let i = -1; i < settings.cacheNextSong; i++) {
		const index = (sound.index + sound.songList.length + i) % sound.songList.length
		if (!sound.songList[index].isDownloaded) {
			await urlStream(config, sound.songList[index].id)
				.then ((_) => {
					sound.songList[index].isDownloaded = true
				})
		}
	}
}

export const playSong = async (config, sound, songs, index) => {
	sound.songInfo = songs[index]
	sound.index = index
	if (Platform.OS === 'web') {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: songs[index].title,
			artist: songs[index].artist,
			album: songs[index].album,
			artwork: [{ src: urlCover(config, songs[index].albumId) }],
		})
	}
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
	downloadNextSong(config, sound)
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