import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { getApiNetworkFirst } from '~/utils/api';
import { playSong } from '~/utils/player';
import { SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { useCachedAndApi } from '~/utils/api';
import BackButton from '~/components/button/BackButton';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import IconButton from '~/components/button/IconButton';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import SongsList from '~/components/lists/SongsList';

const Genre = ({ route }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)

	const albums = useCachedAndApi([], 'getAlbumList', { type: 'byGenre', genre: route.params.genre.value }, (json, setData) => {
		setData(json?.albumList?.album)
	})

	const songs = useCachedAndApi([], 'getSongsByGenre', { genre: route.params.genre.value, count: 50 }, (json, setData) => {
		setData(json?.songsByGenre?.song)
	})

	const getRandomSongs = () => {
		getApiNetworkFirst(config, 'getRandomSongs', { genre: route.params.genre.value, count: 50 })
			.then((json) => {
				const songs = json.randomSongs?.song
				if (!songs) return
				playSong(config, songDispatch, songs, 0)
			})
			.catch((error) => { })
	}

	return (
		<ScrollView
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}
			vertical={true}
		>
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
			<HorizontalAlbums albums={albums} />
			<Text style={{ ...mainStyles.subTitle(theme), ...mainStyles.stdVerticalMargin, marginBottom: 14, marginTop: 20 }}>Songs</Text>
			<SongsList songs={songs} />
		</ScrollView>
	)
}

const styles = {
	title: {
		color: '#F9F2F3',
		fontSize: 50,
		fontWeight: 'bold',
	},
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