import React from 'react'
import { Text, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { useSongDispatch } from '~/contexts/song'
import { useConfig } from '~/contexts/config'
import { useTheme } from '~/contexts/theme'
import { playSong } from '~/utils/player'
import { useCachedAndApi, getApiNetworkFirst } from '~/utils/api'
import { urlCover } from '~/utils/url'
import { shuffle } from '~/utils/tools'
import mainStyles from '~/styles/main'
import presStyles from '~/styles/pres'
import FavoritedButton from '~/components/button/FavoritedButton'
import HorizontalAlbums from '~/components/lists/HorizontalAlbums'
import HorizontalArtists from '~/components/lists/HorizontalArtists'
import IconButton from '~/components/button/IconButton'
import SongsList from '~/components/lists/SongsList'
import size from '~/styles/size'
import PresHeader from '~/components/PresHeader'
import OptionsArtist from '../../components/options/OptionsArtist'

const Artist = ({ navigation, route: { params } }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const config = useConfig()
	const songDispatch = useSongDispatch()
	const theme = useTheme()
	const allSongs = React.useRef([])
	const [sortAlbum, setSortAlbum] = React.useState([])
	const [isOption, setIsOption] = React.useState(false)

	const [artistInfo] = useCachedAndApi([], 'getArtistInfo', `id=${params.id}`, (json, setData) => {
		setData(json.artistInfo)
	}, [params.id])

	const [artist] = useCachedAndApi([], 'getArtist', `id=${params.id}`, (json, setData) => {
		setData(json.artist)
		setSortAlbum(json.artist?.album?.sort((a, b) => (b.year || 0) - (a.year || 0)))
	}, [params.id])

	const [topSongs] = useCachedAndApi([], 'getTopSongs', { artist: params.name, count: 50 }, (json, setData) => {
		setData(json.topSongs?.song || [])
	}, [params.name])

	const [favorited] = useCachedAndApi([], 'getStarred2', null, (json, setData) => {
		setData(json.starred2.song.filter(song => song.artistId === params.id))
	}, [params.id])

	const getRandomSongs = async () => {
		if (!artist.album) return
		if (!allSongs.current.length) {
			const songsPending = artist.album.map(async album => {
				return await getApiNetworkFirst(config, 'getAlbum', `id=${album.id}`)
					.then((json) => {
						return json.album.song
					})
					.catch(() => { })
			})
			allSongs.current = (await Promise.all(songsPending)).flat()
		}
		playSong(config, songDispatch, shuffle(allSongs.current), 0)
	}

	return (
		<>
			<OptionsArtist
				artist={artist}
				artistInfo={artistInfo}
				isOption={isOption}
				setIsOption={setIsOption}
			/>
			<ScrollView
				style={mainStyles.mainContainer(theme)}
				vertical={true}
				contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
				<PresHeader
					title={artist.name || params.name}
					subTitle={t('Artist')}
					imgSrc={urlCover(config, params)}
					onPressOption={() => {
						setIsOption(true)
					}}
				>
					<IconButton
						style={[presStyles.button, { justifyContent: 'flex-start', paddingEnd: 7.5 }]}
						icon="arrow-up"
						size={size.icon.medium}
						onPress={() => topSongs.length && playSong(config, songDispatch, topSongs || [], 0)}
					/>
					<IconButton
						style={[presStyles.button, { justifyContent: 'flex-start', paddingStart: 7.5, paddingEnd: 7.5 }]}
						icon="random"
						size={size.icon.medium}
						onPress={getRandomSongs}
					/>
					<FavoritedButton
						id={params.id}
						isFavorited={artist?.starred}
						style={[presStyles.button, { paddingStart: 7.5 }]}
						size={size.icon.medium}
					/>
				</PresHeader>
				{sortAlbum?.length ? (
					<>
						<Pressable onPress={() => navigation.navigate('ArtistAlbums', { albums: sortAlbum })} style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}>
							<Text style={[mainStyles.titleSection(theme), { marginTop: 5, flex: 1, marginEnd: 0 }]}>{t('Albums')}</Text>
							<Icon
								name='angle-right'
								color={theme.secondaryText}
								size={size.icon.medium}
								style={[mainStyles.titleSection(theme), { marginTop: 5, marginEnd: 20 }]}
							/>
						</Pressable>
						<HorizontalAlbums albums={sortAlbum} year={true} />
					</>
				) : null}
				{
					artistInfo?.similarArtist?.length ? (
						<>
							<Text style={mainStyles.titleSection(theme)}>{t('Similar artists')}</Text>
							<HorizontalArtists artists={artistInfo.similarArtist} />
						</>
					) : null
				}
				{
					topSongs?.length ? (
						<>
							<Pressable onPress={() => navigation.navigate('Songs', { title: t('Top songs'), songs: topSongs })} style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								width: '100%',
							}}>
								<Text style={[mainStyles.titleSection(theme)]}>{t('Top songs')}</Text>
								<Icon
									name='angle-right'
									color={theme.secondaryText}
									size={size.icon.medium}
									style={[mainStyles.titleSection(theme), { marginTop: 25, marginBottom: 12, marginEnd: 20, alignSelf: 'flex-end' }]}
								/>
							</Pressable>
							<SongsList songs={topSongs.slice(0, 3)} listToPlay={topSongs} />
						</>
					) : null
				}
				{
					favorited?.length ? (
						<>
							<Text style={[mainStyles.titleSection(theme),]}>{t('Favorited songs')}</Text>
							<SongsList songs={favorited} />
						</>
					) : null
				}
			</ScrollView>
		</>
	)
}

export default Artist