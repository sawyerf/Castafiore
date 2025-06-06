import React from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
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
import size from '~/styles/size';

const Genre = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)

	const [albums] = useCachedAndApi([], 'getAlbumList2', { type: 'byGenre', genre: params.genre.value }, (json, setData) => {
		setData(json?.albumList2?.album)
	})

	const [songs] = useCachedAndApi([], 'getSongsByGenre', { genre: params.genre.value, count: 50 }, (json, setData) => {
		setData(json?.songsByGenre?.song)
	})

	const getRandomSongs = () => {
		getApiNetworkFirst(config, 'getRandomSongs', { genre: params.genre.value, count: 50 })
			.then((json) => {
				const songs = json.randomSongs?.song
				if (!songs) return
				playSong(config, songDispatch, songs, 0)
			})
			.catch(() => { })
	}

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}
			vertical={true}
		>
			<BackButton />
			<View
				style={styles.cover}
			>
				<Text style={styles.title}>{params.genre.value}</Text>
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}><Icon name="heart" size={size.icon.small} color={theme.primaryTouch} /> {params.genre.value}</Text>
					<Text style={presStyles.subTitle(theme)}>{params.genre?.albumCount || 0} albums · {params.genre?.songCount || 0} songs </Text>
				</View>
				<IconButton
					style={[presStyles.button, { justifyContent: 'flex-start', paddingStart: 20, paddingEnd: 20 }]}
					icon="random"
					size={size.icon.medium}
					onPress={getRandomSongs}
				/>
			</View>
			<Text style={[mainStyles.titleSection(theme), { marginTop: 0 }]}>Albums</Text>
			<HorizontalAlbums albums={albums} />
			<Text style={mainStyles.titleSection(theme)}>Songs</Text>
			<SongsList songs={songs} />
		</ScrollView>
	)
}

const styles = StyleSheet.create({
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
})

export default Genre;