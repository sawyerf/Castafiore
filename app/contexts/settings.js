import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';

export const defaultSettings = {
	homeOrder: [
		{ icon: 'bar-chart', title: 'Week Activity', type: 'listenbrainz', query: '', enable: false },
		{ icon: 'user', title: 'Favorited Artist', type: 'artist', query: '', enable: true },
		{ icon: 'flask', title: 'Genre', type: 'genre', query: '', enable: false },
		{ icon: 'feed', title: 'Radio', type: 'radio', query: '', enable: false },
		{ icon: 'heart', title: 'Favorited', type: 'album', query: 'type=starred', enable: true },
		{ icon: 'plus', title: 'Recently Added', type: 'album', query: 'type=newest', enable: true },
		{ icon: 'trophy', title: 'Most Played', type: 'album', query: 'type=frequent', enable: true },
		{ icon: 'play', title: 'Recently Played', type: 'album', query: 'type=recent', enable: true },
		{ icon: 'random', title: 'Random', type: 'album', query: 'type=random', enable: false },
		{ icon: 'arrow-up', title: 'Highest', type: 'album', query: 'type=highest', enable: false },
	],
	listenBrainzUser: '',
	sizeOfList: 10,
	orderPlaylist: 'title',
	pinPlaylist: [],
	previewFavorited: 3,
	isDesktop: false,
	servers: [
		{
			name: 'Demo',
			url: 'https://demo.navidrome.org',
			username: 'demo',
			query: `u=${encodeURI('demo')}&t=${md5('demo' + 'aaaaaa')}&s=${'aaaaaa'}&v=1.16.1&c=castafiore&f=json`
		}
	],
	// Future settings
	endOfQueue: 'repeat', type: 'album', // stop, repeat, random, recomandation
	cacheNextSong: 5,
	theme: 'castafiore',
	scrollHelper: false,
}

export const getSettings = async () => {
	const config = await AsyncStorage.getItem('settings')
	if (config === null) return defaultSettings
	try {
		const data = JSON.parse(config)
		return {
			...defaultSettings,
			...data,
		}
	} catch (error) {
		return defaultSettings
	}
}

export const SettingsContext = React.createContext()
export const SetSettingsContext = React.createContext()