import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';

export const defaultSettings = {
	homeOrder: [
		{ icon: 'bar-chart', title: 'Week Activity', type: 'listenbrainz', query: '', enable: false },
		{ icon: 'user', title: 'Favorited Artist', type: 'artist', query: '', enable: true },
		{ icon: 'flask', title: 'Genre', type: 'genre', query: '', enable: false },
		{ icon: 'feed', title: 'Radio', type: 'radio', query: '', enable: false },
		{ icon: 'book', title: 'Pin Playlist', type: 'playlist', query: '', enable: false },
		// { icon: 'group', title: 'Artists', type: 'artist_all', query: '', enable: false },
		{ icon: 'heart', title: 'Favorited', type: 'album_star', query: '', enable: true },
		{ icon: 'plus', title: 'Recently Added', type: 'album', query: 'type=newest', enable: true },
		{ icon: 'trophy', title: 'Most Played', type: 'album', query: 'type=frequent', enable: true },
		{ icon: 'play', title: 'Recently Played', type: 'album', query: 'type=recent', enable: true },
		{ icon: 'random', title: 'Random', type: 'album', query: 'type=random', enable: false },
		{ icon: 'arrow-up', title: 'Highest', type: 'album', query: 'type=highest', enable: false },
	],
	listenBrainzUser: '',
	sizeOfList: 15,
	orderPlaylist: 'title',
	previewFavorited: 3,
	isDesktop: false,
	servers: [
		{
			name: 'Demo',
			url: 'https://demo.navidrome.org',
			username: 'demo',
			query: `u=${encodeURI('demo')}&t=${md5('demo' + 'aaaaaa')}&s=${'aaaaaa'}&v=1.16.1&c=castafiore`
		}
	],
	cacheNextSong: 5,
	theme: 'castafiore',
	themePlayer: 'default',
	scrollHelper: false,
	showCache: false,
	streamFormat: 'raw',
	maxBitRate: 0,
	reversePlaylist: false,
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
	} catch {
		return defaultSettings
	}
}

export const SettingsContext = React.createContext()
export const SetSettingsContext = React.createContext()

export const getPathByType = (type) => {
	if (type === 'album') return 'getAlbumList'
	if (type === 'artist' || type === 'album_star') return 'getStarred'
	if (type === 'genre') return 'getGenres'
	if (type === 'artist_all') return 'getArtists'
	if (type === 'radio') return 'getInternetRadioStations'
	if (type === 'playlist') return 'getPlaylists'
	return type
}

export const setListByType = (json, type, setList) => {
	if (!json) return
	if (type == 'album') return setList(json?.albumList?.album)
	if (type == 'album_star') return setList(json?.starred?.album)
	if (type == 'artist') return setList(json?.starred?.artist)
	if (type == 'artist_all') return setList(json?.artists?.index.map((item) => item.artist).flat())
	if (type == 'genre') return setList(json?.genres?.genre)
	if (type == 'radio') return setList(json?.internetRadioStations?.internetRadioStation)
	if (type == 'playlist') return setList(json?.playlists?.playlist)
}