import React from 'react'
import { Pressable, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { getCachedAndApi, getUrl } from '~/utils/api'
import { getJsonCache } from '~/utils/cache'
import { ThemeContext } from '~/contexts/theme'
import { SettingsContext, homeSections } from '~/contexts/settings'
import { ConfigContext } from '~/contexts/config'
import { UpdateApiContext, isUpdatable } from '~/contexts/updateApi'
import HorizontalAlbums from '~/components/lists/HorizontalAlbums'
import HorizontalArtists from '~/components/lists/HorizontalArtists'
import HorizontalGenres from '~/components/lists/HorizontalGenres'
import HorizontalLBStat from '~/components/lists/HorizontalLBStat'
import HorizontalPlaylists from '~/components/lists/HorizontalPlaylists'
import mainStyles from '~/styles/main'
import RadioList from '~/components/lists/RadioList'
import size from '~/styles/size'
import logger from '~/utils/logger'

const HorizontalList = ({ refresh, id, enable }) => {
	const { t } = useTranslation()
	const [list, setList] = React.useState()
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const navigation = useNavigation()
	const config = React.useContext(ConfigContext)
	const updateApi = React.useContext(UpdateApiContext)
	const section = React.useMemo(() => homeSections.find(s => s.id === id), [id])

	React.useEffect(() => {
		if (!enable) return
		if (config.query) {
			getList()
		}
	}, [config, refresh, enable])

	React.useEffect(() => {
		if (!enable) return
		if (section?.type === 'listenbrainz') {
			getList()
		}
	}, [settings.listenBrainzUser])

	React.useEffect(() => {
		if (!enable) return
		if (!section) return
		let nquery = section.query || ''

		if (section.type == 'album') nquery += '&size=' + settings.sizeOfList

		if (isUpdatable(updateApi, section.path, nquery)) {
			getJsonCache('api', getUrl(config, section.path, nquery))
				.then(json => {
					if (!json) return
					section.getInfo(json, setList)
				})
		}
	}, [updateApi])

	const getList = async () => {
		let nquery = section.query ? section.query : ''

		if (section.type == 'album') nquery += '&size=' + settings.sizeOfList
		if (section.type == 'listenbrainz') {
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
				.catch(error => logger.error('ListenBrainz Stats', error))
		} else {
			getCachedAndApi(config, section.path, nquery, (json) => section.getInfo(json, setList))
		}
	}

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
				disabled={!section.isShowAll}
				onPress={() => { navigation.navigate('ShowAll', { section }) }}
			>
				<Text numberOfLines={1} style={[mainStyles.titleSection(theme), {
					flex: 1,
					marginEnd: 0,
				}]}>{t(`homeSection.${section.title}`)}</Text>
				{
					section.isShowAll && <Icon
						name='angle-right'
						color={theme.secondaryText}
						size={size.icon.medium}
						style={mainStyles.titleSection(theme)}
					/>
				}
			</Pressable>
			{section.type === 'album' && <HorizontalAlbums albums={list} />}
			{section.type === 'album_star' && <HorizontalAlbums albums={list} />}
			{section.type === 'artist' && <HorizontalArtists artists={list} />}
			{section.type === 'artist_all' && <HorizontalArtists artists={list} />}
			{section.type === 'genre' && <HorizontalGenres genres={list} />}
			{section.type === 'radio' && <RadioList radios={list} />}
			{section.type === 'listenbrainz' && <HorizontalLBStat stats={list} />}
			{section.type === 'playlist' && <HorizontalPlaylists playlists={list} />}
		</>
	)
}

export default HorizontalList