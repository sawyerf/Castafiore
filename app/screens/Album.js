import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '../utils/config';
import theme from '../utils/theme';
import SongsList from '../components/SongsList';
import mainStyles from '../styles/main';
import presStyles from '../styles/pres';
import RandomButton from '../components/RandomButton';
import BackButton from '../components/BackButton';

const Album = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [songs, setSongs] = React.useState([]);
	const config = React.useContext(ConfigContext)

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
			<BackButton />
			{config.url && <Image
				style={presStyles.cover}
				source={{
					uri: `${config.url}/rest/getCoverArt?id=${route.params.album.coverArt}&${config.query}`,
				}}
			/>}
			<View>
				<Text style={presStyles.title}>{route.params.album.name}</Text>
				<TouchableOpacity onPress={() => navigation.navigate('Artist', { artist: { id: route.params.album.artistId, name: route.params.album.artist } })}>
					<Text style={presStyles.subTitle}>{route.params.album.artist}</Text>
				</TouchableOpacity>
				<RandomButton songList={songs} />
			</View>
			<SongsList config={config} songs={songs} isIndex={true} />
		</ScrollView>
	)
}

const styles = {
}

export default Album;