import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import PlayerBox from '../components/PlayerBox';
import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import HorizontalAlbumList from '../components/HorizontalAlbumList';
import SongsList from '../components/SongsList';
import HorizontalArtists from '../components/HorizontalArtists';
import HorizontalAlbums from '../components/HorizontalAlbums';


const Search = () => {
	const insets = useSafeAreaInsets();
	const [config, setConfig] = React.useState({});
	const [query, setQuery] = React.useState('');
	const [results, setResults] = React.useState();
	const [timeout, setTimeoutState] = React.useState(null);

	React.useEffect(() => {
		getConfig()
			.then((config) => {
				setConfig(config)
			})
	}, [])

	React.useEffect(() => {
		if (query.length > 0) {
			clearTimeout(timeout)
			setTimeoutState(setTimeout(() => {
				getSearch()
			}, 500))
		}
	}, [query])

	const getSearch = () => {
		console.log('search2:', query)
		fetch(`${config.url}/rest/search2?query=${query}&${config.query}`)
			.then((response) => response.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setResults(json['subsonic-response'].searchResult2)
				} else {
					setResults(undefined)
					console.log('search2:', json['subsonic-response']?.error)
				}

			})
	}

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: theme.primaryDark,
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left,
				paddingRight: insets.right,
			}} >
			<Text style={{ color: theme.primaryLight, fontSize: 30, fontWeight: 'bold', margin: 20, marginTop: 30 }}>Search</Text>
			<View style={{ marginBottom: 20, marginStart: 20, marginEnd: 20, flexDirection: 'row' }}>
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
					placeholder="Server Url"
					placeholderTextColor={theme.secondaryLight}
					value={query}
					onChangeText={(query) => setQuery(query)}
				/>
				{ query ? <Button title="Clear" onPress={() => setQuery('')} color={theme.primaryTouch} style={{flex: 0, backgroundColor: 'red', alignSelf: 'flex-end'}} /> : null }
				<Icon name="search" size={20} color={theme.secondaryLight} style={{ position: 'absolute', left: 0, margin: 8 }} />
			</View>
			<ScrollView vertical={true} contentContainerStyle={{ paddingBottom: 40 }}>
				{
					!query.length ? ['la feve', 'jul', 'welarue'].map((previousSearch, index) => {
						return (
							<TouchableOpacity key={index} onPress={() => setQuery(previousSearch)} style={{ marginStart: 20, marginEnd: 20 }}>
								<Text style={{ color: theme.secondaryLight, fontSize: 17, marginBottom: 15, marginTop: 10 }}><Icon name="eye" size={17} color={theme.secondaryLight} />  {previousSearch}</Text>
								<View style={{ flex: 1, marginStart: 10, marginEnd: 10, backgroundColor: theme.secondaryDark, height: 2, borderRadius: 2 }} />
							</TouchableOpacity>
						)
					}) : null
				}
				{query.length && results ? (
					<View>
						{
							results.artist ? (
								<>
									<Text style={styles.subTitle}>Artists</Text>
									<HorizontalArtists artists={results.artist} config={config} />
								</>
							) : null
						}
						{
							results.album ? (
								<>
									<Text style={styles.subTitle}>Albums</Text>
									<HorizontalAlbums albums={results.album} config={config} />
								</>
							) : null
						}
						{
							results.song ? (
								<>
									<Text style={styles.subTitle}>Songs</Text>
									<SongsList songs={results.song} config={config} />
								</>
							) : null
						}
					</View>
				) : null
				}
			</ScrollView >
		</View >
	)
}

const styles = {
	subTitle: {
		color: theme.primaryLight,
		fontSize: 25,
		fontWeight: 'bold',
		margin: 20
	}
}

export default Search;