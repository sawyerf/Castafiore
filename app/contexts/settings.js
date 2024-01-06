import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const defaultSettings = {
	homeOrder: [
		{ icon: 'user', title: 'Favorited Artist', type: 'artist', query: '', enable: true },
		{ icon: 'flask', title: 'Genre', type: 'genre', query: '', enable: false },
		{ icon: 'heart', title: 'Favorited', type: 'album', query: 'type=starred', enable: true },
		{ icon: 'plus', title: 'Recently Added', type: 'album', query: 'type=newest', enable: true },
		{ icon: 'trophy', title: 'Most Played', type: 'album', query: 'type=frequent', enable: true },
		{ icon: 'play', title: 'Recently Played', type: 'album', query: 'type=recent', enable: true },
		{ icon: 'random', title: 'Random', type: 'album', query: 'type=random', enable: false },
		{ icon: 'arrow-up', title: 'Highest', type: 'album', query: 'type=highest', enable: false },
	],
	// Future settings
	endOfQueue: 'repeat', type: 'album', // stop, repeat, random, recomandation
	cacheNextSong: 5,
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