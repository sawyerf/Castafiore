import React from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongDispatchContext } from '~/contexts/song';
import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { playSong } from '~/utils/player';
import { urlCover, useCachedAndApi, getApiNetworkFirst } from '~/utils/api';
import { shuffle } from '~/utils/tools';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import BackButton from '~/components/button/BackButton';
import FavoritedButton from '~/components/button/FavoritedButton';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import HorizontalArtists from '~/components/lists/HorizontalArtists';
import IconButton from '~/components/button/IconButton';
import size from '~/styles/size';

const Artist = ({ route }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)
	const allSongs = React.useRef([])

	const artistInfo = useCachedAndApi([], 'getArtistInfo', `id=${route.params.artist.id}`, (json, setData) => {
		setData(json.artistInfo)
	}, [route.params.artist])

	const artist = useCachedAndApi([], 'getArtist', `id=${route.params.artist.id}`, (json, setData) => {
		setData(json.artist)
	}, [route.params.artist])

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
		getApiNetworkFirst(config, 'getTopSongs', { artist: route.params.artist.name, count: 50 })
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
			<BackButton />
			<Image
				style={presStyles.cover}
				source={{
					uri: urlCover(config, route.params.artist.id),
				}}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}>{route.params.artist.name}</Text>
					<Text style={presStyles.subTitle(theme)}>Artist {route.params.artist.id === undefined ? 'not found' : ''}</Text>
				</View>
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
					id={route.params.artist.id}
					isFavorited={artist?.starred}
					style={[presStyles.button, { paddingStart: 7.5 }]}
					size={size.icon.medium}
				/>
			</View>
			<Text style={[mainStyles.titleSection(theme), { marginTop: 0 }]}>Albums</Text>
			<HorizontalAlbums albums={artist.album} year={true} />
			{
				artistInfo?.similarArtist?.length && (
					<>
						<Text style={mainStyles.titleSection(theme)}>Similar Artist</Text>
						<HorizontalArtists artists={artistInfo.similarArtist} />
					</>
				)
			}
		</ScrollView >
	)
}

export default Artist;