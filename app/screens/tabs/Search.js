import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../../utils/theme';
import { getConfig } from '../../utils/config';
import SongsList from '../../components/SongsList';
import HorizontalArtists from '../../components/HorizontalArtists';
import HorizontalAlbums from '../../components/HorizontalAlbums';
import mainStyles from '../../styles/main';


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
		if (query.length > 1) {
			clearTimeout(timeout)
			setTimeoutState(setTimeout(() => {
				getSearch()
			}, 500))
		}
	}, [query])

	const getSearch = () => {
		fetch(`${config.url}/rest/search2?query=${encodeURIComponent(query)}&${config.query}`)
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
		<View style={mainStyles.mainContainer(insets)} >
			<Text style={mainStyles.mainTitle}>Search</Text>
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
					placeholder="Server Url"
					placeholderTextColor={theme.secondaryLight}
					value={query}
					onChangeText={(query) => setQuery(query)}
				/>
				{
					query &&
					<TouchableOpacity
						onPress={() => { setQuery(''); setResults(undefined) }}
						style={{ justifyContent: 'center' }}>
						<Text size={20} style={{ color: theme.primaryTouch }}>Clear</Text>
					</TouchableOpacity>
				}
				<Icon name="search" size={20} color={theme.secondaryLight} style={{ position: 'absolute', left: 0, margin: 9 }} />
			</View>
			<ScrollView vertical={true} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
				{
					!query.length && ['la feve', 'jul', 'welarue'].map((previousSearch, index) => {
						return (
							<TouchableOpacity key={index} onPress={() => setQuery(previousSearch)} style={mainStyles.stdVerticalMargin}>
								<Text style={{ color: theme.secondaryLight, fontSize: 17, marginBottom: 15, marginTop: 10 }}><Icon name="eye" size={17} color={theme.secondaryLight} />  {previousSearch}</Text>
								<View style={{ flex: 1, marginStart: 10, marginEnd: 10, backgroundColor: theme.secondaryDark, height: 2, borderRadius: 2 }} />
							</TouchableOpacity>
						)
					})
				}
				{query.length && results ? (
					<View>
						{
							results.artist &&
							<>
								<Text style={{ ...mainStyles.subTitle, margin: 20 }}>Artists</Text>
								<HorizontalArtists artists={results.artist} config={config} />
							</>
						}
						{
							results.album &&
							<>
								<Text style={{ ...mainStyles.subTitle, margin: 20, marginBottom: 10 }}>Albums</Text>
								<HorizontalAlbums albums={results.album} config={config} />
							</>
						}
						{
							results.song &&
							<>
								<Text style={{ ...mainStyles.subTitle, margin: 20 }}>Songs</Text>
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