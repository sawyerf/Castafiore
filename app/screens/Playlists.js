import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HorizontalAlbumList from '../components/HorizontalAlbumList';
import PlayerBox from '../components/PlayerBox';
import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import SongsList from '../components/SongsList';


const Playlists = () => {
	const insets = useSafeAreaInsets();
	const [favorited, setFavorited] = React.useState([]);
	const [playlists, setPlaylists] = React.useState([]);
	const [config, setConfig] = React.useState({});

	const getFavorited = () => {
		fetch(config.url + '/rest/getStarred?' + config.query)
			.then((response) => response.json())
			.then((json) => {
				setFavorited(json['subsonic-response'].starred.song)
			})
	}

	const getPlaylists = () => {
		fetch(config.url + '/rest/getPlaylists?' + config.query)
			.then((response) => response.json())
			.then((json) => {
				setPlaylists(json['subsonic-response'].playlists.playlist)
			})
	}

	React.useEffect(() => {
		getConfig()
			.then((config) => {
				setConfig(config)
			})
	}, [])

	React.useEffect(() => {
		if (config.url) {
			getFavorited()
			getPlaylists()
		}
	}, [config])

	return (
		<View style={{ flex: 1 }}>
			<ScrollView
				vertical={true}
				style={{
					flex: 1,
					backgroundColor: theme.primaryDark,
					paddingTop: insets.top,
					paddingBottom: insets.bottom + 50,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
				contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
				<Text style={{ color: theme.primaryLight, fontSize: 30, fontWeight: 'bold', marginBottom: 20, marginTop: 30, marginStart: 20 }}>Your Playlists</Text>
				<View style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingRight: 10,
				}}>
					<Text style={styles.subTitle}>❤️ Favorited</Text>
					<Text style={{ color: theme.secondaryLight, fontWeight: 'bold' }}>{favorited?.length} ></Text>
				</View>
					<SongsList songs={favorited?.slice(0, 3)} config={config} />
				<Text style={styles.subTitle}>❤️ Playlists</Text>
				{
					playlists.map((playlist) => {
						return (
							<View style={styles.favoritedSong} key={playlist.id}>
								<Image
									style={styles.albumCover}
									source={{
										uri: config.url + '/rest/getCoverArt?id=' + playlist.coverArt + '&size=100&' + config.query,
									}}
								/>
								<View style={{ flex: 1, flexDirection: 'column' }}>
									<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2 }}>{playlist.name}</Text>
									<Text numberOfLines={1} style={{ color: theme.secondaryLight }}>{(playlist.duration / 60) | 1} minutes</Text>

								</View>
							</View>
						)
					})
				}
			</ScrollView>
		</View>
	)
}

const styles = {
	favoritedSong: {
		flexDirection: 'row',
		alignItems: 'center',
		marginStart: 20,
		marginBottom: 10,
	},
	albumCover: {
		height: 50,
		width: 50,
		marginRight: 10,
		borderRadius: 4,
	},
	subTitle: {
		color: theme.primaryLight,
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 10,
		marginStart: 20,
		marginTop: 20,
		marginBottom: 20,
	}
}

export default Playlists;