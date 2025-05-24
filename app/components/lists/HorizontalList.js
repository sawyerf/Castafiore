import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'

import { getCachedAndApi, getUrl } from '~/utils/api';
import { getJsonCache } from '~/utils/cache';
import { ThemeContext } from '~/contexts/theme';
import { SettingsContext } from '~/contexts/settings';
import { ConfigContext } from '~/contexts/config';
import { UpdateApiContext, isUpdatable } from '~/contexts/updateApi';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import HorizontalArtists from '~/components/lists/HorizontalArtists';
import HorizontalGenres from '~/components/lists/HorizontalGenres';
import HorizontalLBStat from '~/components/lists/HorizontalLBStat';
import HorizontalPlaylists from '~/components/lists/HorizontalPlaylists';
import mainStyles from '~/styles/main';
import RadioList from '~/components/lists/RadioList';
import size from '~/styles/size';

const HorizontalList = ({ title, type, query, refresh, enable }) => {
	const [list, setList] = React.useState();
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const navigation = useNavigation();
	const config = React.useContext(ConfigContext)
	const updateApi = React.useContext(UpdateApiContext)

	React.useEffect(() => {
		if (!enable) return
		if (config.query) {
			getList()
		}
	}, [config, refresh, type, query, enable, settings.listenBrainzUser])

	React.useEffect(() => {
		const path = getPath()
		let nquery = query ? query : ''

		if (type == 'album') nquery += '&size=' + settings.sizeOfList

		if (isUpdatable(updateApi, path, nquery)) {
			getJsonCache('api', getUrl(config, path, query))
				.then(setListByType)
		}
	}, [updateApi])

	const setListByType = (json) => {
		if (!json) return
		if (type == 'album') return setList(json?.albumList?.album)
		if (type == 'artist') return setList(json?.starred?.artist)
		if (type == 'genre') return setList(json?.genres?.genre)
		if (type == 'radio') return setList(json?.internetRadioStations?.internetRadioStation)
		if (type == 'playlist') return setList(json?.playlists?.playlist)
	}

	const getPath = () => {
		if (type === 'album') return 'getAlbumList'
		if (type === 'artist') return 'getStarred'
		if (type === 'genre') return 'getGenres'
		if (type === 'radio') return 'getInternetRadioStations'
		if (type === 'playlist') return 'getPlaylists'
		return type
	}

	const getList = async () => {
		const path = getPath()
		let nquery = query ? query : ''

		if (type == 'album') nquery += '&size=' + settings.sizeOfList
		if (type == 'listenbrainz') {
			if (!settings.listenBrainzUser) return setList('No ListenBrainz user set')
			fetch(`https://api.listenbrainz.org/1/stats/user/${encodeURIComponent(settings.listenBrainzUser)}/listening-activity?range=this_week`, { mode: 'cors' })
				.then(response => response.json())
				.then(data => {
					if (data.error) return (
						setList(data.error)
					)
					if (!data?.payload?.listening_activity?.length) return
					setList(data.payload.listening_activity)
				})
				.catch(error => console.error(error))
		} else {
			getCachedAndApi(config, path, nquery, setListByType)
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
				disabled={type !== 'album' && type !== 'artist'}
				onPress={() => { navigation.navigate('ShowAll', { title, type, query }) }}
			>
				<Text style={mainStyles.titleSection(theme)}>{title}</Text>
				{
					['album', 'artist'].includes(type) && <Icon
						name='angle-right'
						color={theme.secondaryText}
						size={size.icon.medium}
						style={mainStyles.titleSection(theme)}
					/>
				}
			</Pressable>
			{type === 'album' && <HorizontalAlbums albums={list} />}
			{type === 'artist' && <HorizontalArtists artists={list} />}
			{type === 'genre' && <HorizontalGenres genres={list} />}
			{type === 'radio' && <RadioList radios={list} />}
			{type === 'listenbrainz' && <HorizontalLBStat stats={list} />}
			{type === 'playlist' && <HorizontalPlaylists playlists={list} />}
		</>
	)
}

export default HorizontalList;