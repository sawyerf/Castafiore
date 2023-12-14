import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import SongsList from '../components/SongsList';
import mainStyles from '../styles/main';
import presStyles from '../styles/pres';

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
			fetch(`${config.url}/rest/getPlaylist?id=${route.params.playlist.id}&${config.query}`)
				.then((response) => response.json())
				.then((json) => {
					if (json['subsonic-response'] && !json['subsonic-response']?.error) {
						setSongs(json['subsonic-response'].playlist?.entry)
					} else {
						console.log('getPlaylist:', json['subsonic-response']?.error)
					}
				})
		}
	}, [config, route.params.playlist])

	return (
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets),
				paddingTop: 0,
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			{config.url && <Image
				style={presStyles.cover}
				source={{
					uri: `${config.url}/rest/getCoverArt?id=${route.params.playlist.coverArt}&${config.query}`,
				}}
			/>}
			<Text style={presStyles.title}>{route.params.playlist.name}</Text>
			<Text style={presStyles.subTitle}>{(route.params.playlist.duration / 60) | 1} minutes · {route.params.playlist.songCount} songs</Text>
			<SongsList config={config} songs={songs} />
		</ScrollView>
	)
}

const styles = {
}

export default Playlist;