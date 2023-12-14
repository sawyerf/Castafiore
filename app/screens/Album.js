import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import SongsList from '../components/SongsList';
import mainStyles from '../styles/main';
import presStyles from '../styles/pres';

const Album = ({ navigation, route }) => {
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
			fetch(`${config.url}/rest/getAlbum?id=${route.params.album.id}&${config.query}`)
				.then((response) => response.json())
				.then((json) => {
					if (json['subsonic-response'] && !json['subsonic-response']?.error) {
						setSongs(json['subsonic-response'].album?.song)
					} else {
						console.log('getAlbum:', json['subsonic-response']?.error)
					}
				})
		}
	}, [config, route.params.album])

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
					uri: `${config.url}/rest/getCoverArt?id=${route.params.album.coverArt}&${config.query}`,
				}}
			/>}
			<Text style={presStyles.title}>{route.params.album.name}</Text>
			<TouchableOpacity onPress={() => navigation.navigate('Artist', { artist: { id: route.params.album.artistId, name: route.params.album.artist } })}>
				<Text style={presStyles.subTitle}>{route.params.album.artist}</Text>
			</TouchableOpacity>
			<SongsList config={config} songs={songs} />
		</ScrollView>
	)
}

const styles = {
}

export default Album;