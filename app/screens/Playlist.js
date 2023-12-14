import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PlayerBox from '../components/PlayerBox';
import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import SongsList from '../components/SongsList';

const Playlist = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [config, setConfig] = React.useState({});
	const [songs, setSongs] = React.useState([]);

	React.useEffect(() => {
		getConfig()
			.then((config) => {
				setConfig(config)
			})
	}, [])

	React.useEffect(() => {
		if (config.url) {
			fetch(config.url + '/rest/getPlaylist?id=' + route.params.playlist.id + '&' + config.query)
				.then((response) => response.json())
				.then((json) => {
					if (json['subsonic-response'] && !json['subsonic-response']?.error) {
						setSongs(json['subsonic-response'].playlist?.entry)
					} else {
						console.log('getPlaylist:', json['subsonic-response']?.error)
					}
				})
		}
	}, [config])

	return (
		<View style={{ flex: 1 }}>
			<ScrollView
				vertical={true}
				style={{
					flex: 1,
					backgroundColor: theme.primaryDark,
					// paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
				contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
				{config.url && <Image
					style={styles.playlistCover}
					source={{
						uri: config.url + '/rest/getCoverArt?id=' + route.params.playlist.coverArt + '&' + config.query,
					}}
				/>}
				<Text style={{ color: theme.primaryLight, fontSize: 30, fontWeight: 'bold', margin: 15, marginBottom: 0 }}>{route.params.playlist.name}</Text>
				<Text style={{ color: theme.secondaryLight, fontSize: 20, marginBottom: 40, marginStart: 15 }}>{(route.params.playlist.duration / 60) | 1} minutes · {route.params.playlist.songCount} songs</Text>
				<SongsList config={config} songs={songs} />
			</ScrollView>
		</View>
	)
}

const styles = {
	playlistCover: {
		flex: 1,
		width: "100%",
		height: 300,
	},
}

export default Playlist;