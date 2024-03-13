import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export const getTheme = (settings = undefined) => {
	const listTheme = Object.keys(themes)

	if (!settings?.theme) return themes.castafiore
	else if (listTheme.includes(settings.theme)) return themes[settings.theme]
	else return themes.castafiore
}

export const ThemeContext = React.createContext()

export const themes = {
	castafiore: {
		// Use for background
		primaryDark: '#121212',
		secondaryDark: '#1e1e1e',
		// Use for text
		primaryLight: '#f5f5dc',
		secondaryLight: 'gray',
		// Use for button
		primaryTouch: '#cd1921',
		secondaryTouch: '#891116',

		// Color of the player
		playerBackground: '#1e1e1e',
		playerPrimaryText: '#f5f5dc',
		playerSecondaryText: 'gray',
		playerButton: '#cd1921'
	},
	deezer: {
		primaryDark: '#000000',
		secondaryDark: '#191414',
		primaryLight: '#FFFFFF',
		secondaryLight: '#B3B3B3',
		primaryTouch: '#a238ff',
		secondaryTouch: '#a238ff',

		playerBackground: '#155faa',
		playerPrimaryText: 'white',
		playerSecondaryText: 'white',
		playerButton: 'white'
	},
	spotify: {
		primaryDark: '#000000',
		secondaryDark: '#191414',
		primaryLight: '#FFFFFF',
		secondaryLight: '#B3B3B3',
		primaryTouch: '#1DB954',
		secondaryTouch: '#1ED760',

		playerBackground: '#191414',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#B3B3B3',
		playerButton: '#1DB954'
	},
	appleMusic: {
		primaryDark: '#000000',
		secondaryDark: '#1C1C1E',
		primaryLight: '#FFFFFF',
		secondaryLight: '#B3B3B3',
		primaryTouch: '#FF2D55',
		secondaryTouch: '#FF375F',

		playerBackground: '#1C1C1E',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#B3B3B3',
		playerButton: '#FF2D55'
	},
	soundCloud: {
		primaryDark: '#FFFFFF',
		secondaryDark: '#f2f2f2',
		primaryLight: '#000000',
		secondaryLight: '##f2f2f2',
		primaryTouch: '#FF7700',
		secondaryTouch: '#FF8800',

		playerBackground: '#FF7700',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#f3e3d6',
		playerButton: 'white'
	},
	reddit: {
		primaryDark: '#1A1A1B',
		secondaryDark: '#141415',
		primaryLight: '#FFFFFF',
		secondaryLight: '#D7DADC',
		primaryTouch: '#FF4500',
		secondaryTouch: '#ff4500',

		playerBackground: '#141415',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#D7DADC',
		playerButton: '#FF4500'
	},
	lightMode: {
		primaryDark: '#f6f6ef',
		secondaryDark: '#eaeae1',
		primaryLight: '#121212',
		secondaryLight: '#1e1e1e',
		primaryTouch: '#cd1921',
		secondaryTouch: '#891116',

		playerBackground: '#eaeae1',
		playerPrimaryText: '#121212',
		playerSecondaryText: '#1e1e1e',
		playerButton: '#cd1921'
	},
}