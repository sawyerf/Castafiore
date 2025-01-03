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
		tertiaryDark: '#2e2e2e',
		// Use for text
		primaryLight: '#f5f5dc',
		secondaryLight: '#808080',
		// Use for button
		primaryTouch: '#cd1921',
		secondaryTouch: '#891116',
		innerTouch: '#f5f5dc',

		// Color of the player
		playerBackground: '#1e1e1e',
		playerPrimaryText: '#f5f5dc',
		playerSecondaryText: '#808080',
		playerButton: '#cd1921'
	},
	deezer: {
		primaryDark: '#000000',
		secondaryDark: '#191414',
		tertiaryDark: '#2e2e2e',
		primaryLight: '#FFFFFF',
		secondaryLight: '#B3B3B3',
		primaryTouch: '#a238ff',
		secondaryTouch: '#862ed4',
		innerTouch: '#FFFFFF',

		playerBackground: '#155faa',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	spotify: {
		primaryDark: '#000000',
		secondaryDark: '#191414',
		tertiaryDark: '#2e2e2e',
		primaryLight: '#FFFFFF',
		secondaryLight: '#B3B3B3',
		primaryTouch: '#1DB954',
		secondaryTouch: '#1BAD4F',
		innerTouch: '#FFFFFF',

		playerBackground: '#191414',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#B3B3B3',
		playerButton: '#1DB954'
	},
	appleMusic: {
		primaryDark: '#000000',
		secondaryDark: '#1C1C1E',
		tertiaryDark: '#2e2e2e',
		primaryLight: '#FFFFFF',
		secondaryLight: '#B3B3B3',
		primaryTouch: '#FF2D55',
		secondaryTouch: '#C42341',
		innerTouch: '#FFFFFF',

		playerBackground: '#1C1C1E',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#B3B3B3',
		playerButton: '#FF2D55'
	},
	reddit: {
		primaryDark: '#1A1A1B',
		secondaryDark: '#141415',
		tertiaryDark: '#2e2e2e',
		primaryLight: '#FFFFFF',
		secondaryLight: '#D7DADC',
		primaryTouch: '#FF4500',
		secondaryTouch: '#CF3800',
		innerTouch: '#FFFFFF',

		playerBackground: '#141415',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#D7DADC',
		playerButton: '#FF4500'
	},
	soundCloud: {
		primaryDark: '#FFFFFF',
		secondaryDark: '#f2f2f2',
		tertiaryDark: '#f3f3f3',
		primaryLight: '#000000',
		secondaryLight: '#999999',
		primaryTouch: '#FF7700',
		secondaryTouch: '#FF8800',
		innerTouch: '#FFFFFF',

		playerBackground: '#FF7700',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#f3e3d6',
		playerButton: '#FFFFFF'
	},
	lightMode: {
		primaryDark: '#fdfcfe',
		secondaryDark: '#f6f2f8',
		tertiaryDark: '#dcdcd4',

		primaryLight: '#040208',
		secondaryLight: '#a09fa0',

		primaryTouch: '#cd1921',
		secondaryTouch: '#891116',
		innerTouch: '#f6f6ef',

		playerBackground: '#eaeae1',
		playerPrimaryText: '#121212',
		playerSecondaryText: '#1e1e1e',
		playerButton: '#cd1921'
	},
}