import { Audio } from 'expo-av';
import React from 'react';
import { getConfig } from './config';
import { getApi, urlCover } from './api';
import { Platform } from 'react-native';

// TODO: Solve Unhandle Promise Rejection Warning
export const SoundContext = React.createContext()

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
		{ uri: `${config.url}/rest/stream?id=${songs[index].id}&${config.query}` },
		{
			shouldPlay: true,
			staysActiveInBackground: true,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
		}
	)
	getApi(config, 'scrobble', `id=${sound.songInfo.id}&submission=false`)
		.catch((error) => { })
	// fetch('/lolipop/keepAppUp')
	// 	.catch((error) => { })
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