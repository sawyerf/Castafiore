import React from 'react';
import { Text, View } from 'react-native';

import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { SettingsContext } from '~/contexts/settings';
import HorizontalAlbums from './HorizontalAlbums';
import HorizontalArtists from './HorizontalArtists';
import HorizontalGenres from './HorizontalGenres';
import mainStyles from '~/styles/main';
import RadioList from './RadioList';

const HorizontalList = ({ config, title, type, query, refresh, enable }) => {
	const [list, setList] = React.useState();
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)

	React.useEffect(() => {
		if (!enable) return
		if (!refresh) return
		getList()
	}, [refresh])

	React.useEffect(() => {
		if (!enable) return
		if (config.query) {
			getList()
		}
	}, [config, type, query, enable])

	const getPath = () => {
		if (type === 'album') return 'getAlbumList'
		if (type === 'artist') return 'getStarred'
		if (type === 'genre') return 'getGenres'
		if (type === 'radio') return 'getInternetRadioStations'
	}

	const getList = async () => {
		const path = getPath()
		let nquery = query ? query : ''

		if (type == 'album') nquery += '&size=' + settings.sizeOfList

		getCachedAndApi(config, path, nquery, (json) => {
			if (type == 'album') return setList(json?.albumList?.album)
			if (type == 'artist') return setList(json?.starred?.artist)
			if (type == 'genre') return setList(json?.genres?.genre)
			if (type == 'radio') return setList(json?.internetRadioStations?.internetRadioStation)
		})
	}

	if (!enable) return null
	if (!list) return null
	return (
		<View>
			<Text style={mainStyles.titleSection(theme)}>{title}</Text>
			{type === 'album' && <HorizontalAlbums config={config} albums={list} />}
			{type === 'artist' && <HorizontalArtists config={config} artists={list} />}
			{type === 'genre' && <HorizontalGenres config={config} genres={list} />}
			{type === 'radio' && <RadioList config={config} radios={list} />}
		</View>
	)
}

export default HorizontalList;