import React from 'react';
import { Text, View } from 'react-native';

import { getApi } from '~/utils/api';
import theme from '~/utils/theme';
import HorizontalAlbums from './HorizontalAlbums';
import HorizontalArtists from './HorizontalArtists';
import HorizontalGenres from './HorizontalGenres';
import mainStyles from '~/styles/main';
import RadioList from './RadioList';

const HorizontalList = ({ config, title, type, query, refresh, enable }) => {
	const [list, setList] = React.useState();

	React.useEffect(() => {
		if (!enable) return
		if (!refresh) return
		if (type === 'album') getAlbumList()
		if (type === 'artist') getArtistList()
		if (type === 'genre') getGenreList()
		if (type === 'radio') getRadioList()
	}, [refresh])

	React.useEffect(() => {
		if (!enable) return
		if (config.query) {
			if (type === 'album') getAlbumList()
			if (type === 'artist') getArtistList()
			if (type === 'genre') getGenreList()
			if (type === 'radio') getRadioList()
		}
	}, [config, type, query, enable])

	const getGenreList = async () => {
		getApi(config, 'getGenres', query)
			.then((json) => {
				setList(json?.genres?.genre)
			})
			.catch((error) => { })
	}

	const getAlbumList = async () => {
		getApi(config, 'getAlbumList', query)
			.then((json) => {
				setList(json?.albumList?.album)
			})
			.catch((error) => { })
	}

	const getArtistList = async () => {
		getApi(config, 'getStarred', query)
			.then((json) => {
				setList(json?.starred?.artist)
			})
			.catch((error) => { })
	}

	const getRadioList = async () => {
		getApi(config, 'getInternetRadioStations')
			.then((json) => {
				setList(json.internetRadioStations.internetRadioStation)
			})
			.catch((error) => { })
	}

	if (!enable) return null
	if (!list) return null
	return (
		<View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingRight: 10,
					marginTop: 20,
					marginBottom: 10,
				}}>
				<Text style={{ ...mainStyles.subTitle, ...mainStyles.stdVerticalMargin }}>{title}</Text>
			</View>
			{type === 'album' && <HorizontalAlbums config={config} albums={list} />}
			{type === 'artist' && <HorizontalArtists config={config} artists={list} />}
			{type === 'genre' && <HorizontalGenres config={config} genres={list} />}
			{type === 'radio' && <RadioList config={config} radios={list} />}
		</View>
	)
}

const styles = {
	albumList: {
		width: '100%',
		paddingLeft: 10,
	},
	album: {
		margin: 10,
		width: 160,
		height: 210,
		alignItems: 'center',
	},
	albumCover: {
		width: 160,
		height: 160,
		marginBottom: 6,
	},
	titleAlbum: {
		color: theme.primaryLight,
		fontSize: 14,
		width: 160,
		marginBottom: 3,
		marginTop: 3,
	},
	artist: {
		color: theme.secondaryLight,
		fontSize: 14,
		width: 160,
	},
}

export default HorizontalList;