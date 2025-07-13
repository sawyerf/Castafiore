import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome'

import { getCachedAndApi, getUrl } from '~/utils/api';
import { getJsonCache } from '~/utils/cache';
import { ThemeContext } from '~/contexts/theme';
import { SettingsContext, getPathByType, setListByType } from '~/contexts/settings';
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
	const { t } = useTranslation();
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
		const path = getPathByType(type)
		let nquery = query ? query : ''

		if (type == 'album') nquery += '&size=' + settings.sizeOfList

		if (isUpdatable(updateApi, path, nquery)) {
			getJsonCache('api', getUrl(config, path, query))
				.then(json => setListByType(json, type, setList))
		}
	}, [updateApi])

	const getList = async () => {
		const path = getPathByType(type)
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
			getCachedAndApi(config, path, nquery, (json) => setListByType(json, type, setList))
		}
	}

	const isShowAllType = React.useCallback((type) => {
		return ['album', 'artist', 'album_star', 'artist_all'].includes(type)
	}, [])

	if (!enable) return null
	if (!list) return null
	if (list?.length === 0) return null
	return (
		<>
			<Pressable
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					width: '100%',
				}}
				disabled={!isShowAllType(type)}
				onPress={() => { navigation.navigate('ShowAll', { title: t(`homeSection.${title}`), type, query }) }}
			>
				<Text numberOfLines={1} style={[mainStyles.titleSection(theme), {
					flex: 1,
					marginEnd: 0,
				}]}>{t(`homeSection.${title}`)}</Text>
				{
					isShowAllType(type) && <Icon
						name='angle-right'
						color={theme.secondaryText}
						size={size.icon.medium}
						style={mainStyles.titleSection(theme)}
					/>
				}
			</Pressable>
			{type === 'album' && <HorizontalAlbums albums={list} />}
			{type === 'album_star' && <HorizontalAlbums albums={list} />}
			{type === 'artist' && <HorizontalArtists artists={list} />}
			{type === 'artist_all' && <HorizontalArtists artists={list} />}
			{type === 'genre' && <HorizontalGenres genres={list} />}
			{type === 'radio' && <RadioList radios={list} />}
			{type === 'listenbrainz' && <HorizontalLBStat stats={list} />}
			{type === 'playlist' && <HorizontalPlaylists playlists={list} />}
		</>
	)
}

export default HorizontalList;