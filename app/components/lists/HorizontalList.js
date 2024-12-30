import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'

import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { SettingsContext } from '~/contexts/settings';
import HorizontalAlbums from './HorizontalAlbums';
import HorizontalArtists from './HorizontalArtists';
import HorizontalGenres from './HorizontalGenres';
import HorizontalLBStat from './HorizontalLBStat';
import mainStyles from '~/styles/main';
import RadioList from './RadioList';

const HorizontalList = ({ config, title, type, query, refresh, enable }) => {
	const [list, setList] = React.useState();
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const navigation = useNavigation();

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
	}, [config, type, query, enable, settings.listenBrainzUser])

	const getPath = () => {
		if (type === 'album') return 'getAlbumList'
		if (type === 'artist') return 'getStarred'
		if (type === 'genre') return 'getGenres'
		if (type === 'radio') return 'getInternetRadioStations'
		return type
	}

	const getList = async () => {
		const path = getPath()
		let nquery = query ? query : ''

		if (type == 'album') nquery += '&size=' + settings.sizeOfList
		if (type == 'listenbrainz') {
			fetch(`https://api.listenbrainz.org/1/stats/user/${encodeURIComponent(settings.listenBrainzUser)}/listening-activity?range=this_week`, { mode: 'cors' })
				.then(response => response.json())
				.then(data => setList(data.payload.listening_activity))
				.catch(error => console.error(error))
		} else {
			getCachedAndApi(config, path, nquery, (json) => {
				if (type == 'album') return setList(json?.albumList?.album)
				if (type == 'artist') return setList(json?.starred?.artist)
				if (type == 'genre') return setList(json?.genres?.genre)
				if (type == 'radio') return setList(json?.internetRadioStations?.internetRadioStation)
			})
		}
	}

	if (!enable) return null
	if (!list) return null
	return (
		<>
			<Pressable
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					width: '100%',
				}}
				onPress={() => { navigation.navigate('ShowAll', { title, type, query, }) }}
			>
				<Text style={mainStyles.titleSection(theme)}>{title}</Text>
				{
					['album', 'artist'].includes(type) && <Icon
						name='angle-right'
						color={theme.secondaryLight}
						size={25}
						style={mainStyles.titleSection(theme)}
					/>
				}
			</Pressable>
			{type === 'album' && <HorizontalAlbums config={config} albums={list} />}
			{type === 'artist' && <HorizontalArtists config={config} artists={list} />}
			{type === 'genre' && <HorizontalGenres config={config} genres={list} />}
			{type === 'radio' && <RadioList config={config} radios={list} />}
			{type === 'listenbrainz' && <HorizontalLBStat config={config} stats={list} />}
		</>
	)
}

export default HorizontalList;