import React from 'react'
import { Platform } from 'react-native'

import { useSettings } from '~/contexts/settings'

const getTheme = (settings = undefined) => {
	const listTheme = Object.keys(themes)

	if (!settings?.theme) return themes.castafiore
	else if (listTheme.includes(settings.theme)) return {
		...themes[settings.theme],
		...themesPlayer[settings.themePlayer]
	}
	else return themes.castafiore
}

const ThemeContext = React.createContext()

export const useTheme = () => React.useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = React.useState(getTheme())
	const settings = useSettings()

	React.useEffect(() => {
		setTheme(getTheme(settings))
	}, [settings.theme, settings.themePlayer])

	React.useEffect(() => {
		if (Platform.OS === 'web') window.document.documentElement.style.backgroundColor = theme.primaryBack
	}, [theme])

	return (
		<ThemeContext.Provider value={theme}>
			{children}
		</ThemeContext.Provider>
	)
}

export const themes = {
	castafiore: {
		// Use for background
		primaryBack: '#121212',
		secondaryBack: '#1e1e1e',
		tertiaryBack: '#2e2e2e',
		// Use for text
		primaryText: '#f5f5dc',
		secondaryText: '#808080',
		// Use for button
		primaryTouch: '#cd1921',
		secondaryTouch: '#891116',
		innerTouch: '#f5f5dc',
		backgroundTouch: '#2e2e2e',

		// Color of the player
		playerBackground: '#1e1e1e',
		playerPrimaryText: '#f5f5dc',
		playerSecondaryText: '#808080',
		playerButton: '#cd1921',

		barStyle: 'light',
	},
	deezer: {
		primaryBack: '#000000',
		secondaryBack: '#191414',
		tertiaryBack: '#2e2e2e',
		primaryText: '#FFFFFF',
		secondaryText: '#B3B3B3',
		primaryTouch: '#a238ff',
		secondaryTouch: '#862ed4',
		innerTouch: '#FFFFFF',
		backgroundTouch: '#FFFFFF',

		playerBackground: '#155faa',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF',

		barStyle: 'light',
	},
	spotify: {
		primaryBack: '#000000',
		secondaryBack: '#121212',
		tertiaryBack: '#2e2e2e',
		primaryText: '#FFFFFF',
		secondaryText: '#B3B3B3',
		primaryTouch: '#1DB954',
		secondaryTouch: '#1BAD4F',
		innerTouch: '#FFFFFF',
		backgroundTouch: '#FFFFFF',

		playerBackground: '#191414',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#B3B3B3',
		playerButton: '#1DB954',

		barStyle: 'light',
	},
	appleMusic: {
		primaryBack: '#000000',
		secondaryBack: '#1C1C1E',
		tertiaryBack: '#2e2e2e',
		primaryText: '#FFFFFF',
		secondaryText: '#B3B3B3',
		primaryTouch: '#FF2D55',
		secondaryTouch: '#C42341',
		innerTouch: '#FFFFFF',
		backgroundTouch: '#FFFFFF',

		playerBackground: '#1C1C1E',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#B3B3B3',
		playerButton: '#FF2D55',

		barStyle: 'light',
	},
	reddit: {
		primaryBack: '#1A1A1B',
		secondaryBack: '#141415',
		tertiaryBack: '#2e2e2e',
		primaryText: '#FFFFFF',
		secondaryText: '#D7DADC',
		primaryTouch: '#FF4500',
		secondaryTouch: '#CF3800',
		innerTouch: '#FFFFFF',
		backgroundTouch: '#FFFFFF',

		playerBackground: '#141415',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#D7DADC',
		playerButton: '#FF4500',

		barStyle: 'light',
	},
	soundCloud: {
		primaryBack: '#FFFFFF',
		secondaryBack: '#f2f2f2',
		tertiaryBack: '#f3f3f3',
		primaryText: '#000000',
		secondaryText: '#999999',
		primaryTouch: '#FF7700',
		secondaryTouch: '#FF8800',
		innerTouch: '#FFFFFF',
		backgroundTouch: '#ffe7d3',

		playerBackground: '#FF7700',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#f3e3d6',
		playerButton: '#FFFFFF',

		barStyle: 'dark',
	},
	lightMode: {
		primaryBack: '#f2f2f6',
		secondaryBack: '#fcfcfc',
		tertiaryBack: '#dcdcd4',

		primaryText: '#040208',
		secondaryText: '#8f8f93',

		primaryTouch: '#fe3c30',
		secondaryTouch: '#ee392e',
		innerTouch: '#f6f6ef',
		backgroundTouch: '#d0d0d0',

		playerBackground: '#ffffff',
		playerPrimaryText: '#121212',
		playerSecondaryText: '#1e1e1e',
		playerButton: '#fe3c30',

		barStyle: 'dark',
	},
	'blue lightMode': {
		primaryBack: '#ffffff',
		secondaryBack: '#f2f1f3',
		tertiaryBack: '#f3f3f4',

		primaryText: '#060608',
		secondaryText: '#7c7c7d',

		primaryTouch: '#4a65f0',
		secondaryTouch: '#5ba8ff',
		innerTouch: '#fff',
		backgroundTouch: '#d2e7ff',

		playerBackground: '#f3f3f4',
		playerPrimaryText: '#121212',
		playerSecondaryText: '#1e1e1e',
		playerButton: '#4a65f0',

		barStyle: 'dark',
	},
	'light mono': {
		primaryBack: '#ffffff',
		secondaryBack: '#f2f2f2',
		tertiaryBack: '#dcdcd4',

		primaryText: '#505050',
		secondaryText: '#999999',

		primaryTouch: '#000000',
		secondaryTouch: '#000000',
		innerTouch: '#ffffff',
		backgroundTouch: '#dcdcd4',

		playerBackground: '#b2b2b2',
		playerPrimaryText: '#000000',
		playerSecondaryText: '#404040',
		playerButton: '#000000',

		barStyle: 'dark',
	},
	'dark mono': {
		primaryBack: '#000000',
		secondaryBack: '#1e1e1e',
		tertiaryBack: '#2e2e2e',

		primaryText: '#FFFFFF',
		secondaryText: '#808080',

		primaryTouch: '#B3B3B3',
		secondaryTouch: '#B3B3B3',
		innerTouch: '#000000',
		backgroundTouch: '#2e2e2e',

		playerBackground: '#1e1e1e',
		playerPrimaryText: '#f5f5dc',
		playerSecondaryText: '#808080',
		playerButton: '#FFFFFF',

		barStyle: 'light',
	},
}

export const themesPlayer = {
	default: {},
	blue: {
		playerBackground: '#155faa',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	red: {
		playerBackground: '#cd1921',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	green: {
		playerBackground: '#1DB954',
		playerPrimaryText: '#000',
		playerSecondaryText: '#000',
		playerButton: '#000'
	},
	pink: {
		playerBackground: '#ce8bac',
		playerPrimaryText: '#000',
		playerSecondaryText: '#000',
		playerButton: '#000'
	},
	orange: {
		playerBackground: '#FF7700',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	gray: {
		playerBackground: '#808080',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	purple: {
		playerBackground: '#9244d7',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	yellow: {
		playerBackground: '#FFCC00',
		playerPrimaryText: '#000000',
		playerSecondaryText: '#000000',
		playerButton: '#000000'
	},
	brown: {
		playerBackground: '#633731',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	black: {
		playerBackground: '#000000',
		playerPrimaryText: '#FFFFFF',
		playerSecondaryText: '#FFFFFF',
		playerButton: '#FFFFFF'
	},
	white: {
		playerBackground: '#FFFFFF',
		playerPrimaryText: '#000000',
		playerSecondaryText: '#000000',
		playerButton: '#000000'
	},
}