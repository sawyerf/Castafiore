import React from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SongContext } from '~/contexts/song';
import { ConfigContext } from '~/contexts/config';
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
		getApi(config, 'getTopSongs', `artist=${encodeURIComponent(route.params.artist.name)}&count=50`)
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
				...mainStyles.mainContainer(insets),
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
					<Text style={{ ...presStyles.title }}>{route.params.artist.name}</Text>
					<Text style={presStyles.subTitle}>Artist</Text>
				</View>
				<IconButton
					style={{ ...presStyles.button, justifyContent: undefined }}
					icon="arrow-up"
					size={25}
					onPress={getTopSongs}
				/>
				<IconButton
					style={{ ...presStyles.button, justifyContent: undefined, paddingStart: 0, paddingEnd: 0 }}
					icon="random"
					size={25}
					onPress={getRandomSongs}
				/>
				<FavoritedButton
					id={route.params.artist.id}
					isFavorited={artist.starred}
					style={{ ...presStyles.button }}
					config={config}
					size={25}
				/>
			</View>
			<Text style={{ ...mainStyles.subTitle, marginStart: 20 }}>Albums</Text>
			<HorizontalAlbums config={config} albums={artist.album} />
			{
				artistInfo?.similarArtist?.length && (
					<>
						<Text style={{ ...mainStyles.subTitle, margin: 20 }}>Similar Artist</Text>
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