import React from 'react';
import { Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeContext } from '~/contexts/theme';
import { ConfigContext } from '~/contexts/config';
import SongsList from '~/components/lists/SongsList';
import HorizontalArtists from '~/components/lists/HorizontalArtists';
import HorizontalAlbums from '~/components/lists/HorizontalAlbums';
import mainStyles from '~/styles/main';
import { getApi } from '~/utils/api';
import IconButton from '~/components/button/IconButton';


const Search = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
  const theme = React.useContext(ThemeContext)
	const [query, setQuery] = React.useState('');
	const [results, setResults] = React.useState();
	const [timeout, setTimeoutState] = React.useState(null);
	const [history, setHistory] = React.useState([]);

	React.useEffect(() => {
		AsyncStorage.getItem('search.history')
			.then((hist) => {
				if (hist) setHistory(JSON.parse(hist))
			})
	}, [])

	React.useEffect(() => {
		if (query.length > 1) {
			clearTimeout(timeout)
			setTimeoutState(setTimeout(() => {
				getSearch()
				setTimeoutState(setTimeout(() => {
					addHistory(query)
				}, 10 * 1000))
			}, 500))
		}
	}, [query])

	const addHistory = async (query) => {
		if (!query || !query.length || history.includes(query)) return
		const hist = [query, ...history]
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
		getApi(config, 'search2', { query })
			.then((json) => {
				setResults(json.searchResult2)
			})
			.catch((error) => {
				setResults(undefined)
			})
	}

	return (
		<View style={mainStyles.mainContainer(insets, theme)} >
			<Text style={mainStyles.mainTitle(theme)}>Search</Text>
			<View style={{ marginBottom: 20, ...mainStyles.stdVerticalMargin, flexDirection: 'row' }}>
				<TextInput
					style={{
						flex: 1,
						color: theme.primaryLight,
						fontSize: 20,
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
				/>
				{
					query &&
					<TouchableOpacity
						onPress={() => { addHistory(query); setQuery(''); setResults(undefined) }}
						style={{ justifyContent: 'center' }}>
						<Text size={20} style={{ color: theme.primaryTouch }}>Clear</Text>
					</TouchableOpacity>
				}
				<Icon name="search" size={20} color={theme.secondaryLight} style={{ position: 'absolute', left: 0, margin: 9 }} />
			</View>
			<ScrollView vertical={true} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
				{
					!query.length && history.map((previousSearch, index) => (
						<TouchableOpacity key={index} onPress={() => setQuery(previousSearch)} style={mainStyles.stdVerticalMargin}>
							<Text style={{ color: theme.secondaryLight, fontSize: 17, marginBottom: 15, marginTop: 10 }}><Icon name="eye" size={17} color={theme.secondaryLight} />  {previousSearch}</Text>
							<IconButton
								icon="times"
								size={14}
								color={theme.secondaryLight}
								style={{ position: 'absolute', top: 0, right: 0, height: '100%', justifyContent: 'center', paddingHorizontal: 10 }}
								onPress={() => delItemHistory(index)}
							/>
							<View style={{ flex: 1, marginStart: 10, marginEnd: 10, backgroundColor: theme.secondaryDark, height: 2, borderRadius: 2 }} />
						</TouchableOpacity>
					))
				}
				{query.length && results && !results.artist && !results.album && !results.song ? (
					<Text style={{
						margin: 20,
						color: theme.secondaryLight,
						fontSize: 20,
						textAlign: 'center',
					}}>No results</Text>
				) : null}
				{query.length && results ? (
					<View>
						{
							results.artist &&
							<>
								<Text style={mainStyles.titleSection(theme)}>Artists</Text>
								<HorizontalArtists artists={results.artist} config={config} />
							</>
						}
						{
							results.album &&
							<>
								<Text style={mainStyles.titleSection(theme)}>Albums</Text>
								<HorizontalAlbums albums={results.album} config={config} />
							</>
						}
						{
							results.song &&
							<>
								<Text style={mainStyles.titleSection(theme)}>Songs</Text>
								<SongsList songs={results.song} config={config} />
							</>
						}
					</View>) : null
				}
			</ScrollView >
		</View >
	)
}

const styles = {
}

export default Search;