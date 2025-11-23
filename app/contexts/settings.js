import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import md5 from 'md5'

export const SettingsContext = React.createContext()
export const SetSettingsContext = React.createContext()

export const demoServers = [
	{
		name: 'Demo LMS',
		type: 'lms',
		url: 'https://lms-demo.poupon.dev',
		username: 'demo',
		query: `u=${encodeURI('demo')}&p=${encodeURI('7e5da62f-e4a2-f946-a790-9872352f82ae')}&v=1.16.1&c=castafiore`
	},
	{
		name: 'Demo Ampache',
		type: 'ampache',
		url: 'https://demo.ampache.dev',
		username: 'demo',
		query: `u=${encodeURI('demo')}&t=${md5('demodemo' + 'aaaaaa')}&s=${'aaaaaa'}&v=1.16.1&c=castafiore`
	}
]

export const defaultSettings = {
	isDesktop: false,
	servers: [
		{
			name: 'Demo',
			type: 'navidrome',
			url: 'https://demo.navidrome.org',
			username: 'demo',
			query: `u=${encodeURI('demo')}&t=${md5('demo' + 'aaaaaa')}&s=${'aaaaaa'}&v=1.16.1&c=castafiore`
		},
	],
	// Home Settings
	homeOrderV2: [
		{ id: 'week-activity', enable: false },
		{ id: 'last-queue', enable: false },
		{ id: 'favorited-artist', enable: true },
		{ id: 'genre', enable: false },
		{ id: 'radio', enable: false },
		{ id: 'pin-playlist', enable: false },
		{ id: 'favorited-album-star', enable: true },
		{ id: 'recently-added', enable: true },
		{ id: 'most-played', enable: true },
		{ id: 'recently-played', enable: true },
		{ id: 'random-album', enable: false },
		{ id: 'highest-album', enable: false },
	],
	listenBrainzUser: '',
	sizeOfList: 15,
	scrollHelper: false,
	// Theme settings
	theme: 'castafiore',
	themePlayer: 'default',
	// Cache settings
	isSongCaching: false,
	cacheNextSong: 5,
	showCache: true,
	// Player settings
	saveQueue: false,
	streamFormat: 'raw',
	maxBitRate: 0,
	playSeedFirst: false,
	repeatQueue: false,
	// Playlist settings
	reversePlaylist: false,
	orderPlaylist: 'title',
	previewFavorited: 3,
	language: null,
}

export const homeSections = [
	{
		icon: 'bar-chart',
		id: 'week-activity',
		title: 'Week Activity',
		type: 'listenbrainz',
		isShowAll: false,
		path: '',
		query: '',
		getInfo: () => { },
	},
	{
		icon: 'list',
		id: 'last-queue',
		title: 'Last queue',
		type: 'queue',
		isShowAll: false,
		path: 'getPlayQueue',
		query: '',
		getInfo: (json, setList) => setList(json?.playQueue),
	},
	{
		icon: 'user',
		id: 'favorited-artist',
		title: 'Favorited Artist',
		type: 'artist',
		isShowAll: true,
		path: 'getStarred2',
		query: '',
		getInfo: (json, setList) => setList(json?.starred2?.artist),
	},
	{
		icon: 'flask',
		id: 'genre',
		title: 'Genre',
		type: 'genre',
		isShowAll: false,
		path: 'getGenres',
		query: '',
		getInfo: (json, setList) => setList(json?.genres?.genre),
	},
	{
		icon: 'feed',
		id: 'radio',
		title: 'Radio',
		type: 'radio',
		isShowAll: false,
		path: 'getInternetRadioStations',
		query: '',
		getInfo: (json, setList) => setList(json?.internetRadioStations?.internetRadioStation),
	},
	{
		icon: 'book',
		id: 'pin-playlist',
		title: 'Pin Playlist',
		type: 'playlist',
		isShowAll: false,
		path: 'getPlaylists',
		query: '',
		getInfo: (json, setList) => setList(json?.playlists?.playlist?.filter((playlist) => playlist.comment?.includes(`#${global.config.username}-pin`))),
	},
	{
		icon: 'heart',
		id: 'favorited-album-star',
		title: 'Favorited',
		type: 'album_star',
		isShowAll: true,
		path: 'getStarred2',
		query: '',
		getInfo: (json, setList) => setList(json?.starred2?.album),
	},
	{
		id: 'recently-added',
		icon: 'plus',
		title: 'Recently Added',
		type: 'album',
		isShowAll: true,
		path: 'getAlbumList2',
		query: 'type=newest',
		getInfo: (json, setList) => setList(json?.albumList2?.album),
	},
	{
		id: 'most-played',
		icon: 'trophy',
		title: 'Most Played',
		type: 'album',
		isShowAll: true,
		path: 'getAlbumList2',
		query: 'type=frequent',
		getInfo: (json, setList) => setList(json?.albumList2?.album),
	},
	{
		id: 'recently-played',
		icon: 'play',
		title: 'Recently Played',
		type: 'album',
		isShowAll: true,
		path: 'getAlbumList2',
		query: 'type=recent',
		getInfo: (json, setList) => setList(json?.albumList2?.album),
	},
	{
		id: 'random-album',
		icon: 'random',
		title: 'Random',
		type: 'album',
		isShowAll: false,
		path: 'getAlbumList2',
		query: 'type=random',
		getInfo: (json, setList) => setList(json?.albumList2?.album),
	},
	{
		id: 'highest-album',
		icon: 'arrow-up',
		title: 'Highest',
		type: 'album',
		isShowAll: true,
		path: 'getAlbumList2',
		query: 'type=highest',
		getInfo: (json, setList) => setList(json?.albumList2?.album),
	},
]

export const getSettings = async () => {
	const rawSettings = await AsyncStorage.getItem('settings')
	if (rawSettings === null) return defaultSettings
	try {
		const data = JSON.parse(rawSettings)
		if (data.homeOrderV2 && data?.homeOrderV2?.length !== defaultSettings.homeOrderV2.length) {
			defaultSettings.homeOrderV2.forEach((section) => {
				if (!data.homeOrderV2.some((s) => s.id === section.id)) {
					data.homeOrderV2.push({ ...section, enable: false })
				}
			})
		}
		return {
			...defaultSettings,
			...data,
			homeOrder: undefined,
		}
	} catch {
		return defaultSettings
	}
}

export const updateGlobalSettings = async (settings) => {
	React.useEffect(() => {
		global.streamFormat = settings.streamFormat
	}, [settings.streamFormat])

	React.useEffect(() => {
		global.maxBitRate = settings.maxBitRate
	}, [settings.maxBitRate])

	React.useEffect(() => {
		global.cacheNextSong = settings.cacheNextSong
	}, [settings.cacheNextSong])

	React.useEffect(() => {
		global.isSongCaching = settings.isSongCaching
	}, [settings.isSongCaching])

	React.useEffect(() => {
		global.saveQueue = settings.saveQueue
	}, [settings.saveQueue])

	React.useEffect(() => {
		global.repeatQueue = settings.repeatQueue
	}, [settings.repeatQueue])
}