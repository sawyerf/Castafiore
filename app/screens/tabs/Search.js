import React from 'react'
import { Text, View, TextInput, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from '~/components/Icon'

import { useConfig } from '~/contexts/config'
import { getApiNetworkFirst, getCachedAndApi, useCachedFirst } from '~/utils/api'
import { urlCover } from '~/utils/url'
import ImageError from '~/components/ImageError'
import { useSettings } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import HorizontalAlbums from '~/components/lists/HorizontalAlbums'
import HorizontalArtists from '~/components/lists/HorizontalArtists'
import mainStyles from '~/styles/main'
import SongsList from '~/components/lists/SongsList'
import HistoryItem from '~/components/item/HistoryItem'
import size from '~/styles/size'
import EmptyState from '~/components/EmptyState'
import SectionTitle from '~/components/SectionTitle'
import RequestSongsList from '~/components/lists/RequestSongsList'
import RequestAlbumsList from '~/components/lists/RequestAlbumsList'
import { isServiceConfigured, searchCatalog } from '~/utils/songService'

const STATES = {
	INIT: 'init',
	TYPING: 'typing',
	LOADING: 'loading',
	LOADED: 'loaded',
	API_ERROR: 'api_error',
	NETWORK_ERROR: 'network_error',
}

// Spotify-style "Browse all" tile colours
const TILE_COLORS = ['#9854B2', '#678026', '#3371E4', '#CF4321', '#ABBB6D', '#223160', '#75A768', '#8768A7']

const BrowseTile = ({ title, color, cover, onPress }) => (
	<Pressable
		accessibilityRole="button"
		style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.tile, { backgroundColor: color }])}
		onPress={onPress}
	>
		<Text numberOfLines={2} style={styles.tileText}>{title}</Text>
		{cover ? <ImageError source={cover} style={styles.tileCover} /> : null}
	</Pressable>
)

const GenreTile = ({ genre, color }) => {
	const config = useConfig()
	const navigation = useNavigation()
	const [album] = useCachedFirst(null, 'getAlbumList2', { type: 'byGenre', genre: genre.value, size: 1 }, (json, setData) => {
		setData(json?.albumList2?.album?.[0] || null)
	})

	return (
		<BrowseTile
			title={genre.value}
			color={color}
			cover={album ? { uri: urlCover(config, album, 100) } : null}
			onPress={() => navigation.navigate('Genre', { name: genre.value, songCount: genre.songCount, albumCount: genre.albumCount })}
		/>
	)
}

const BrowseAll = () => {
	const { t } = useTranslation()
	const theme = useTheme()
	const config = useConfig()
	const navigation = useNavigation()
	const [genres, setGenres] = React.useState([])

	React.useEffect(() => {
		if (!config.query) return
		// ponytail: top 20 genres only, each tile fetches one cover
		getCachedAndApi(config, 'getGenres', '', (json) => setGenres(
			[...(json?.genres?.genre || [])].sort((a, b) => b.songCount - a.songCount).slice(0, 20)
		))
	}, [config])

	const explorers = [
		{ title: t('Artists'), route: 'ArtistExplorer' },
		{ title: t('Albums'), route: 'AlbumExplorer' },
		{ title: t('Songs'), route: 'SongExplorer' },
	]

	return (
		<>
			<Text style={mainStyles.titleSection(theme)}>{t('Browse all')}</Text>
			<View style={styles.grid}>
				{explorers.map((item, index) => (
					<BrowseTile key={item.route} title={item.title} color={TILE_COLORS[index]} onPress={() => navigation.navigate(item.route)} />
				))}
				{genres.map((genre, index) => (
					<GenreTile key={genre.value} genre={genre} color={TILE_COLORS[(index + explorers.length) % TILE_COLORS.length]} />
				))}
			</View>
		</>
	)
}

const SearchResult = ({ state, query, results, history, setHistory, setQuery, addHistory, onRetry }) => {
	const { t } = useTranslation()
	const theme = useTheme()
	const navigation = useNavigation()

	const delItemHistory = async (index) => {
		const hist = [...history]
		hist.splice(index, 1)
		setHistory(hist)
		await AsyncStorage.setItem('search.history', JSON.stringify(hist))
	}

	if (query.length === 0 || state === STATES.INIT) return (
		<>
			{
				history.length === 0 ? null : (
					<>
						<Text style={[mainStyles.titleSection(theme), { fontSize: size.text.medium + 1, marginTop: 10, marginBottom: 3 }]}>{t('Recent searches')}</Text>
						{
							history.map((item, index) => (
								<HistoryItem key={index} itemHist={item} index={index} setQuery={setQuery} delItemHistory={delItemHistory} />
							))
						}
					</>
				)}
			<BrowseAll />
		</>
	)
	else if (state === STATES.LOADING) {
		return (
			<ActivityIndicator size={'large'} color={theme.primaryTouch} />
		)
	}
	else if (state === STATES.LOADED) {
		if (results && !results.artist && !results.album && !results.song) return (
			<EmptyState icon="search" text={t('No results')} />
		)
		else if (results) return (
			<>
				{
					results.artist &&
					<>
						<SectionTitle
							title={t('Artists')}
							onPress={() => navigation.navigate('SearchMore', { type: 'artist', query, items: results.artist })}
							button={results.artist.length === 20}
						/>
						<HorizontalArtists artists={results.artist} onPress={(item) => addHistory({ ...item, mediaType: 'artist' })} />
					</>
				}
				{
					results.album &&
					<>
						<SectionTitle
							title={t('Albums')}
							onPress={() => navigation.navigate('SearchMore', { type: 'album', query, items: results.album })}
							button={results.album.length === 20}
						/>
						<HorizontalAlbums albums={results.album} onPress={(item) => addHistory({ ...item, mediaType: 'album' })} />
					</>
				}
				{
					results.song &&
					<>
						<SectionTitle
							title={t('Songs')}
							onPress={() => navigation.navigate('SearchMore', { type: 'song', query, items: results.song })}
							button={results.song.length === 20}
						/>
						<SongsList songs={results.song} onPress={(item) => {
							addHistory({ ...item, mediaType: 'song' })
							return true
						}} />
					</>
				}
			</>)
	} else if (state === STATES.API_ERROR) return (
		<EmptyState icon="warning" text={t('API Error')} />
	)
	else if (state === STATES.NETWORK_ERROR) return (
		<EmptyState icon="server" text={t('Network Error')} actionText={t('Try again')} onAction={onRetry} />
	)
	return null
}

const CatalogResults = ({ catalog }) => {
	const { t } = useTranslation()
	const theme = useTheme()
	const message = (text) => (
		<Text style={{ marginHorizontal: 20, color: theme.secondaryText, fontSize: size.text.medium }}>{text}</Text>
	)

	if (catalog.state === 'idle') return null
	if (catalog.state === 'unconfigured') return (
		<>
			<Text style={[mainStyles.titleSection(theme), { fontSize: size.text.large, marginTop: 10, marginBottom: 3 }]}>{t('songService.Get more songs')}</Text>
			{message(t('songService.Not configured'))}
		</>
	)
	return (
		<>
			<Text style={[mainStyles.titleSection(theme), { fontSize: size.text.large, marginTop: 10, marginBottom: 3 }]}>{t('songService.Get more songs')}</Text>
			{catalog.state === 'loading' && <ActivityIndicator color={theme.primaryTouch} />}
			{catalog.state === 'error' && message(catalog.error)}
			{catalog.state === 'loaded' && catalog.notice && message(t('songService.Catalogue unavailable'))}
			{catalog.state === 'loaded' && catalog.items.length === 0 && catalog.albums.length === 0 && message(t('songService.No catalogue results'))}
			{catalog.state === 'loaded' && catalog.albums.length > 0 && (
				<>
					<Text style={[mainStyles.smallText(theme.secondaryText), { marginHorizontal: 20 }]}>{t('Albums')}</Text>
					<RequestAlbumsList albums={catalog.albums} />
				</>
			)}
			{catalog.state === 'loaded' && catalog.items.length > 0 && (
				<>
					<Text style={[mainStyles.smallText(theme.secondaryText), { marginHorizontal: 20 }]}>{t('Songs')}</Text>
					<RequestSongsList items={catalog.items} />
				</>
			)}
		</>
	)
}

const Search = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const config = useConfig()
	const settings = useSettings()
	const theme = useTheme()
	const [history, setHistory] = React.useState([])
	const [query, setQuery] = React.useState('')
	const [results, setResults] = React.useState()
	const [state, setState] = React.useState(STATES.INIT)
	const timeout = React.useRef(null)
	const [catalog, setCatalog] = React.useState({ state: 'idle', items: [] })
	const catalogRequest = React.useRef(0)

	React.useEffect(() => {
		if (history.length) return
		AsyncStorage.getItem('search.history')
			.then((hist) => {
				if (hist) setHistory(JSON.parse(hist))
			})
	}, [])

	React.useEffect(() => {
		if (query.length === 0) {
			setState(STATES.INIT)
			catalogRequest.current++
			setCatalog({ state: 'idle', items: [] })
		} else if (query.length > 1) {
			clearTimeout(timeout.current)
			timeout.current = setTimeout(() => {
				getSearch()
			}, 500)
		}
	}, [query])

	const addHistory = async (query) => {
		let hist = []
		if (typeof query === 'string') {
			if (!query || !query.length || history.includes(query)) return
		} else if (typeof query === 'object') {
			if (!query || history.includes(query)) return
		} else return
		hist = [query, ...history]
		setHistory(hist)
		await AsyncStorage.setItem('search.history', JSON.stringify(hist))
	}

	const getCatalog = () => {
		if (!isServiceConfigured(settings)) {
			setCatalog({ state: 'unconfigured', items: [] })
			return
		}
		const id = ++catalogRequest.current
		setCatalog({ state: 'loading', items: [] })
		searchCatalog(settings, query)
			.then((json) => {
				if (id !== catalogRequest.current) return
				setCatalog({ state: 'loaded', items: json.items ?? [], albums: json.albums ?? [], notice: !!json.catalogError })
			})
			.catch((error) => {
				if (id !== catalogRequest.current) return
				setCatalog({ state: 'error', items: [], error: error.message })
			})
	}

	const getSearch = () => {
		getCatalog()
		setState(STATES.LOADING)
		getApiNetworkFirst(config, 'search3', { query })
			.then((json) => {
				setState(STATES.LOADED)
				setResults(json?.searchResult3 || undefined)
			})
			.catch((err) => {
				if (err.isApiError) setState(STATES.API_ERROR)
				else setState(STATES.NETWORK_ERROR)
				setResults(undefined)
			})
	}

	return (
		<View style={[
			mainStyles.mainContainer(theme),
			mainStyles.contentMainContainer(insets), {
				paddingBottom: 0,
			}]}>
			<Text style={mainStyles.mainTitle(theme)}>{t('Search')}</Text>
			<View style={[mainStyles.stdVerticalMargin, { marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
				<TextInput
					style={{
						flex: 1,
						color: theme.primaryBack,
						fontSize: size.text.medium,
						fontWeight: '500',
						textAlign: 'left',
						height: 46,
						paddingHorizontal: 8,
						paddingStart: 42,
						borderRadius: size.radius.md,
						backgroundColor: theme.primaryText,
						outline: 'none',
					}}
					placeholder={t('What do you want to listen to?')}
					placeholderTextColor={theme.tertiaryBack}
					value={query}
					autoCapitalize='none'
					onChangeText={(query) => setQuery(query)}
					autoFocus={settings?.isDesktop}
				/>
				{
					query.length ?
						<Pressable
							onPress={() => { addHistory(query); setQuery(''); setResults(undefined); catalogRequest.current++; setCatalog({ state: 'idle', items: [] }) }}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), { justifyContent: 'center' }])}>
							<Text style={{ color: theme.primaryText, fontWeight: 'bold' }}>{t('Clear')}</Text>
						</Pressable> : null
				}
				<Icon name="search" size={size.icon.small} color={theme.primaryBack} style={{ position: 'absolute', left: 0, paddingVertical: 12.5, paddingHorizontal: 10 }} />
			</View>
			<ScrollView vertical={true} style={{ flex: 1 }} contentContainerStyle={{ flexDirection: 'column', paddingBottom: 80, gap: 10 }}>
				<SearchResult
					state={state}
					query={query}
					results={results}
					history={history}
					setHistory={setHistory}
					setQuery={setQuery}
					addHistory={addHistory}
					onRetry={getSearch}
				/>
				{query.length > 0 && state !== STATES.INIT && <CatalogResults catalog={catalog} />}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 13,
		marginHorizontal: 20,
	},
	tile: {
		flexBasis: '45%',
		flexGrow: 1,
		height: 109,
		borderRadius: size.radius.sm,
		overflow: 'hidden',
		padding: 16,
	},
	tileText: {
		color: '#ffffff',
		fontSize: size.text.medium,
		fontWeight: 'bold',
		width: '70%',
	},
	tileCover: {
		position: 'absolute',
		width: 67,
		height: 67,
		right: -16,
		bottom: 4,
		borderRadius: size.radius.md,
		transform: [{ rotate: '20deg' }],
	},
})

export default Search