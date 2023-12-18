import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '../utils/theme';
import SongsList from '../components/SongsList';
import mainStyles from '../styles/main';
import presStyles from '../styles/pres';
import RandomButton from '../components/RandomButton';
import { ConfigContext } from '../utils/config';
import BackButton from '../components/BackButton';

const Playlist = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [songs, setSongs] = React.useState([]);
	const config = React.useContext(ConfigContext)

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
			<BackButton />
			{config.url && <Image
				style={presStyles.cover}
				source={{
					uri: `${config.url}/rest/getCoverArt?id=${route.params.playlist.coverArt}&${config.query}`,
				}}
			/>}
			<View>
				<Text style={presStyles.title}>{route.params.playlist.name}</Text>
				<Text style={presStyles.subTitle}>{(route.params.playlist.duration / 60) | 1} minutes · {route.params.playlist.songCount} songs</Text>
				<RandomButton songList={songs} />
			</View>
			<SongsList config={config} songs={songs} />
		</ScrollView>
	)
}

const styles = {
}

export default Playlist;