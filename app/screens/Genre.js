import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import BackButton from '~/components/button/BackButton';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import IconButton from '~/components/button/IconButton';
import SongsList from '~/components/lists/SongsList';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import { ThemeContext } from '~/contexts/theme';
import { ConfigContext } from '~/contexts/config';
import { SongContext } from '~/contexts/song';
import { getApi } from '~/utils/api';
import { playSong } from '~/utils/player';
import { getCachedAndApi } from '~/utils/api';

const Genre = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const [song, songDispatch] = React.useContext(SongContext)
	const [albums, setAlbums] = React.useState([]);
	const [songs, setSongs] = React.useState([]);
	const theme = React.useContext(ThemeContext)

	React.useEffect(() => {
		if (config.query) {
			getAlbumsByGenre()
			getSongs()
		}
	}, [config])

	const getRandomSongs = () => {
		getApi(config, 'getRandomSongs', { genre: route.params.genre.value, count: 50 })
			.then((json) => {
				const songs = json.randomSongs?.song
				if (!songs) return
				playSong(config, song, songDispatch, songs, 0)
			})
			.catch((error) => { })
	}

	const getAlbumsByGenre = () => {
		getCachedAndApi(config, 'getAlbumList', { type: 'byGenre', genre: route.params.genre.value }, (json) => {
			setAlbums(json?.albumList?.album)
		})
	}

	const getSongs = () => {
		getCachedAndApi(config, 'getSongsByGenre', { genre: route.params.genre.value, count: 50 }, (json) => {
			setSongs(json?.songsByGenre?.song)
		})
	}

	return (
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets, theme),
				paddingTop: 0,
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<BackButton />
			<View
				style={styles.cover}
			>
				<Text style={styles.title}>{route.params.genre.value}</Text>
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}><Icon name="heart" size={23} color={theme.primaryTouch} /> {route.params.genre.value}</Text>
					<Text style={presStyles.subTitle(theme)}>{route.params.genre?.albumCount || 0} albums · {route.params.genre?.songCount || 0} songs </Text>
				</View>
				<IconButton
					style={{ ...presStyles.button, justifyContent: undefined, paddingStart: 20, paddingEnd: 20 }}
					icon="random"
					size={25}
					onPress={getRandomSongs}
				/>
			</View>
			<Text style={{ ...mainStyles.subTitle(theme), ...mainStyles.stdVerticalMargin }}>Albums</Text>
			<HorizontalAlbums config={config} albums={albums} />
			<Text style={{ ...mainStyles.subTitle(theme), ...mainStyles.stdVerticalMargin, marginBottom: 14, marginTop: 20 }}>Songs</Text>
			<SongsList config={config} songs={songs} />
		</ScrollView>
	)
}

const styles = {
	title: theme => ({
		color: theme.primaryLight,
		fontSize: 50,
		fontWeight: 'bold',
	}),
	cover: {
		width: "100%",
		height: 300,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#c68588',
	},
}

export default Genre;