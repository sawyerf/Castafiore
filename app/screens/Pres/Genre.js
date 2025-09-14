import React from 'react'
import { Text, View, ScrollView, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ConfigContext } from '~/contexts/config'
import { getApiNetworkFirst } from '~/utils/api'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import { ThemeContext } from '~/contexts/theme'
import { useCachedAndApi } from '~/utils/api'
import BackButton from '~/components/button/BackButton'
import HorizontalAlbums from '~/components/lists/HorizontalAlbums'
import IconButton from '~/components/button/IconButton'
import mainStyles from '~/styles/main'
import presStyles from '~/styles/pres'
import SectionTitle from '~/components/SectionTitle'
import size from '~/styles/size'
import SongsList from '~/components/lists/SongsList'

const Genre = ({ route: { params: { name, albumCount = 0, songCount = 0 } } }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation()

	const [albums] = useCachedAndApi([], 'getAlbumList2', { type: 'byGenre', genre: name, size: 20 }, (json, setData) => {
		setData(json?.albumList2?.album)
	})

	const [songs] = useCachedAndApi([], 'getSongsByGenre', { genre: name, count: 50 }, (json, setData) => {
		setData(json?.songsByGenre?.song)
	})

	const getRandomSongs = () => {
		getApiNetworkFirst(config, 'getRandomSongs', { genre: name, count: 50 })
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
			<View style={styles.cover}>
				<Text style={styles.title}>{name}</Text>
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}><Icon name="heart" size={size.icon.small} color={theme.primaryTouch} /> {name}</Text>
					<Text style={presStyles.subTitle(theme)}>{albumCount || 0} albums · {songCount || 0} songs </Text>
				</View>
				<IconButton
					style={[presStyles.button, { justifyContent: 'flex-start', paddingStart: 20, paddingEnd: 20 }]}
					icon="random"
					size={size.icon.medium}
					onPress={getRandomSongs}
				/>
			</View>
			<SectionTitle
				title="Albums"
				onPress={() => {
					navigation.navigate('GenreAlbum', { name, albums })
				}}
				button={albums.length === 20}
			/>
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

export default Genre