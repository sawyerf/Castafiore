import React from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useConfig } from '~/contexts/config'
import { getApiNetworkFirst, getCachedAndApi } from '~/utils/api'
import { urlCover } from '~/utils/url'
import ImageError from '~/components/ImageError'
import { playSong } from '~/utils/player'
import { useSettings } from '~/contexts/settings'
import { useSongDispatch } from '~/contexts/song'
import { useTheme } from '~/contexts/theme'
import Icon from '~/components/Icon'
import HorizontalList from '~/components/lists/HorizontalList'
import IconButton from '~/components/button/IconButton'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

// Spotify-style 2-column grid of recently played albums at the top of Home
const Shortcuts = ({ refresh }) => {
	const config = useConfig()
	const theme = useTheme()
	const navigation = useNavigation()
	const [albums, setAlbums] = React.useState([])

	React.useEffect(() => {
		if (!config.query) return
		getCachedAndApi(config, 'getAlbumList2', 'type=recent&size=8', (json) => setAlbums(json?.albumList2?.album || []))
	}, [config, refresh])

	if (!albums.length) return null
	return (
		<View style={styles.grid}>
			{albums.map(album => (
				<Pressable
					key={album.id}
					accessibilityRole="button"
					style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.tile(theme)])}
					onPress={() => navigation.navigate('Album', album)}
				>
					<ImageError source={{ uri: urlCover(config, album, 100) }} style={styles.tileCover(theme)} />
					<Text numberOfLines={2} style={styles.tileText(theme)}>{album.name}</Text>
				</Pressable>
			))}
		</View>
	)
}

const Home = () => {
	const { t } = useTranslation()
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const songDispatch = useSongDispatch()
	const config = useConfig()
	const settings = useSettings()
	const theme = useTheme()
	const [refresh, setRefresh] = React.useState(0)

	const clickRandomSong = () => {
		getApiNetworkFirst(config, 'getRandomSongs', 'size=50')
			.then((json) => {
				playSong(config, songDispatch, json.randomSongs.song, 0)
			})
			.catch(() => { })
	}

	const forceRefresh = (rotate = () => { }) => {
		setRefresh(refresh + 1)
		rotate()
	}

	return (
		<ScrollView vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
				<View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginHorizontal: 20, marginTop: 12 }}>
					{
						settings.listenBrainzUser ?
							<IconButton
								icon="bell-o"
								size={size.icon.small}
								color={theme.primaryText}
								style={{ paddingHorizontal: 10, paddingVertical: 5 }}
								onPress={() => navigation.navigate('FreshReleases')}
							/> : null
					}
					<Pressable
						accessibilityRole="button"
						style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.boxRandom(theme)])}
						onPress={() => forceRefresh()}>
						<Icon name="refresh" size={size.icon.tiny} color={theme.primaryText} />
						<Text style={styles.textRandom(theme)}>{t('Refresh')}</Text>
					</Pressable>
				</View>
				{config?.url && <Shortcuts refresh={refresh} />}
				<Pressable
					accessibilityRole="button"
					style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.boxRandom(theme), { marginHorizontal: 20, marginTop: 16 }])}
					onPress={clickRandomSong}>
					<Icon name="random" size={size.icon.tiny} color={theme.primaryText} />
					<Text style={styles.textRandom(theme)}>{t('Random Song')}</Text>
				</Pressable>
			{config?.url && settings?.homeOrderV2?.map((value, index) =>
				<HorizontalList key={index} refresh={refresh}{...value} />
			)}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	boxRandom: theme => ({
		backgroundColor: theme.tertiaryBack,
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
		padding: 7,
		paddingHorizontal: 15,
		justifyContent: 'center',
		borderRadius: size.radius.circle,
	}),
	textRandom: theme => ({
		fontSize: size.text.small,
		color: theme.primaryText,
	}),
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginHorizontal: 20,
		marginTop: 16,
	},
	tile: theme => ({
		flexBasis: '45%',
		flexGrow: 1,
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.tertiaryBack,
		borderRadius: size.radius.sm,
		overflow: 'hidden',
	}),
	tileCover: theme => ({
		width: 56,
		height: 56,
		backgroundColor: theme.secondaryBack,
	}),
	tileText: theme => ({
		flex: 1,
		color: theme.primaryText,
		fontSize: size.text.caption + 1,
		fontWeight: 'bold',
		paddingHorizontal: 8,
	}),
})

export default Home