import React from 'react';
import { Text, View, TextInput, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { getApiNetworkFirst } from '~/utils/api';
import { SettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import HorizontalArtists from '~/components/lists/HorizontalArtists';
import mainStyles from '~/styles/main';
import SongsList from '~/components/lists/SongsList';
import HistoryItem from '~/components/HistoryItem';
import size from '~/styles/size';

const Search = () => {
	const [history, setHistory] = React.useState([]);
	const [query, setQuery] = React.useState('');
	const [results, setResults] = React.useState();
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets();
	const settings = React.useContext(SettingsContext)
	const theme = React.useContext(ThemeContext)
	const timeout = React.useRef(null);

	React.useEffect(() => {
		if (history.length) return
		AsyncStorage.getItem('search.history')
			.then((hist) => {
				if (hist) setHistory(JSON.parse(hist))
			})
	}, [])

	React.useEffect(() => {
		if (query.length > 1) {
			clearTimeout(timeout.current)
			timeout.current = setTimeout(() => {
				getSearch()
				timeout.current = setTimeout(() => {
					addHistory(query)
				}, 10 * 1000)
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

	const delItemHistory = async (index) => {
		const hist = [...history]
		hist.splice(index, 1)
		setHistory(hist)
		await AsyncStorage.setItem('search.history', JSON.stringify(hist))
	}

	const getSearch = () => {
		getApiNetworkFirst(config, 'search2', { query })
			.then((json) => {
				setResults(json.searchResult2)
			})
			.catch(() => {
				setResults(undefined)
			})
	}

	return (
		<View style={[
			mainStyles.mainContainer(theme),
			mainStyles.contentMainContainer(insets), {
				paddingBottom: 0,
			}]}>
			<Text style={mainStyles.mainTitle(theme)}>Search</Text>
			<View style={[mainStyles.stdVerticalMargin, { marginBottom: 20, flexDirection: 'row' }]}>
				<TextInput
					style={{
						flex: 1,
						color: theme.primaryLight,
						fontSize: size.text.large,
						padding: 8,
						paddingLeft: 36,
						borderRadius: 10,
						marginEnd: 10,
						backgroundColor: theme.secondaryDark,
					}}
					placeholder="Search"
					placeholderTextColor={theme.secondaryLight}
					value={query}
					onChangeText={(query) => setQuery(query)}
					autoFocus={settings?.isDesktop}
				/>
				{
					query.length ?
						<Pressable
							onPress={() => { addHistory(query); setQuery(''); setResults(undefined) }}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), { justifyContent: 'center' }])}>
							<Text size={size.icon.tiny} style={{ color: theme.primaryTouch }}>Clear</Text>
						</Pressable> : null
				}
				<Icon name="search" size={size.icon.tiny} color={theme.secondaryLight} style={{ position: 'absolute', left: 0, margin: 9 }} />
			</View>
			<ScrollView vertical={true} style={{ flex: 1 }} contentContainerStyle={{ flexDirection: 'column', paddingBottom: 80, gap: 10 }}>
				{
					!query.length &&
					history.map((item, index) => (<HistoryItem key={index} itemHist={item} index={index} setQuery={setQuery} delItemHistory={delItemHistory} />))
				}
				{
					query.length && results && !results.artist && !results.album && !results.song ? (
						<Text style={{
							margin: 20,
							color: theme.secondaryLight,
							fontSize: size.text.large,
							textAlign: 'center',
						}}>No results</Text>
					) : null
				}
				{query.length && results ? (
					<>
						{
							results.artist &&
							<>
								<Text style={mainStyles.titleSection(theme)}>Artists</Text>
								<HorizontalArtists artists={results.artist} onPress={addHistory} />
							</>
						}
						{
							results.album &&
							<>
								<Text style={mainStyles.titleSection(theme)}>Albums</Text>
								<HorizontalAlbums albums={results.album} onPress={addHistory} />
							</>
						}
						{
							results.song &&
							<>
								<Text style={mainStyles.titleSection(theme)}>Songs</Text>
								<SongsList songs={results.song} onPress={addHistory} />
							</>
						}
					</>) : null
				}
			</ScrollView>
		</View>
	)
}

export default Search;