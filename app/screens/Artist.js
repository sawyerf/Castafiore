import React from 'react';
import { Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongDispatchContext } from '~/contexts/song';
import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { playSong } from '~/utils/player';
import { urlCover, useCachedAndApi, getApiNetworkFirst } from '~/utils/api';
import { shuffle } from '~/utils/tools';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import FavoritedButton from '~/components/button/FavoritedButton';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import HorizontalArtists from '~/components/lists/HorizontalArtists';
import IconButton from '~/components/button/IconButton';
import SongsList from '~/components/lists/SongsList';
import size from '~/styles/size';
import PresHeader from '~/components/PresHeader';

const Artist = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)
	const allSongs = React.useRef([])
	const [sortAlbum, setSortAlbum] = React.useState([])

	const [artistInfo] = useCachedAndApi([], 'getArtistInfo', `id=${params.id}`, (json, setData) => {
		setData(json.artistInfo)
	}, [params.id])

	const [artist] = useCachedAndApi([], 'getArtist', `id=${params.id}`, (json, setData) => {
		setData(json.artist)
		setSortAlbum(json.artist?.album?.sort((a, b) => b.year - a.year))
	}, [params.id])

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

	const getTopSongs = () => {
		getApiNetworkFirst(config, 'getTopSongs', { artist: params.name, count: 50 })
			.then((json) => {
				const songs = json.topSongs?.song
				if (!songs) return
				playSong(config, songDispatch, songs, 0)
			})
			.catch(() => { })
	}

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			vertical={true}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
			<PresHeader
				title={params.name}
				subTitle={'Artist'}
				imgSrc={urlCover(config, params)}
			>
				<IconButton
					style={[presStyles.button, { justifyContent: 'flex-start', paddingEnd: 7.5 }]}
					icon="arrow-up"
					size={size.icon.medium}
					onPress={getTopSongs}
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
			<HorizontalAlbums albums={sortAlbum} year={true} />
			{
				artistInfo?.similarArtist?.length && (
					<>
						<Text style={mainStyles.titleSection(theme)}>Similar Artist</Text>
						<HorizontalArtists artists={artistInfo.similarArtist} />
					</>
				)
			}
			{
				favorited?.length ? (
					<>
						<Text style={[mainStyles.titleSection(theme), { marginBottom: 15 }]}>Favorited Songs</Text>
						<SongsList songs={favorited} />
					</>
				) : null
			}
		</ScrollView>
	)
}

export default Artist;