import React from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SongContext } from '~/contexts/song';
import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { playSong } from '~/utils/player';

import { getApi, urlCover } from '~/utils/api';
import { shuffle } from '~/utils/tools';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import BackButton from '~/components/button/BackButton';
import FavoritedButton from '~/components/button/FavoritedButton';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import HorizontalArtists from '~/components/lists/HorizontalArtists';
import IconButton from '~/components/button/IconButton';

const Artist = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [artist, setArtist] = React.useState([]);
	const [artistInfo, setArtistInfo] = React.useState([]);
	const [song, songDispatch] = React.useContext(SongContext)
	const allSongs = React.useRef([])
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	const getArtistInfo = () => {
		getApi(config, 'getArtistInfo', `id=${route.params.artist.id}`)
			.then((json) => {
				setArtistInfo(json.artistInfo)
			})
			.catch((error) => { })
	}

	const getArtist = () => {
		getApi(config, 'getArtist', `id=${route.params.artist.id}`)
			.then((json) => {
				setArtist(json.artist)
			})
			.catch((error) => { })
	}

	const getRandomSongs = async () => {
		if (!artist.album) return
		if (!allSongs.current.length) {
			const songsPending = artist.album.map(async album => {
				return await getApi(config, 'getAlbum', `id=${album.id}`)
					.then((json) => {
						return json.album.song
					})
					.catch((error) => { })
			})
			allSongs.current = (await Promise.all(songsPending)).flat()
		}
		playSong(config, song, songDispatch, shuffle(allSongs.current), 0)
	}

	const getSimilarSongs = () => {
		getApi(config, 'getSimilarSongs', `id=${route.params.artist.id}&count=50`)
			.then((json) => {
				const songs = json.similarSongs.song
				playSong(config, song, songDispatch, songs, 0)
			})
			.catch((error) => { })
	}

	const getTopSongs = () => {
		getApi(config, 'getTopSongs', { artist: route.params.artist.name, count: 50 })
			.then((json) => {
				const songs = json.topSongs?.song
				if (!songs) return
				playSong(config, song, songDispatch, songs, 0)
			})
			.catch((error) => { })
	}

	React.useEffect(() => {
		if (config.query) {
			getArtist()
			getArtistInfo()
		}
	}, [config, route.params.artist])

	return (
		<ScrollView
			style={{
				...mainStyles.mainContainer(insets, theme),
				paddingTop: 0,
			}}
			vertical={true}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<BackButton />
			<Image
				style={presStyles.cover}
				source={{
					uri: urlCover(config, artist.id),
				}}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={{ ...presStyles.title(theme) }}>{route.params.artist.name}</Text>
					<Text style={presStyles.subTitle(theme)}>Artist</Text>
				</View>
				<IconButton
					style={{ ...presStyles.button, justifyContent: undefined, paddingEnd: 7.5 }}
					icon="arrow-up"
					size={25}
					onPress={getTopSongs}
				/>
				<IconButton
					style={{ ...presStyles.button, justifyContent: undefined, paddingStart: 7.5, paddingEnd: 7.5 }}
					icon="random"
					size={25}
					onPress={getRandomSongs}
				/>
				<FavoritedButton
					id={route.params.artist.id}
					isFavorited={artist.starred}
					style={{ ...presStyles.button, paddingStart: 7.5 }}
					config={config}
					size={25}
				/>
			</View>
			<Text style={{...mainStyles.titleSection(theme), marginTop: 0}}>Albums</Text>
			<HorizontalAlbums config={config} albums={artist.album} />
			{
				artistInfo?.similarArtist?.length && (
					<>
						<Text style={mainStyles.titleSection(theme)}>Similar Artist</Text>
						<HorizontalArtists config={config} artists={artistInfo.similarArtist} />
					</>
				)
			}
		</ScrollView >
	)
}

const styles = {
}

export default Artist;