import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import HorizontalAlbumList from '../components/HorizontalAlbumList';
import PlayerBox from '../components/PlayerBox';
import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import SongsList from '../components/SongsList';
import VerticalPlaylist from '../components/VerticalPlaylist';


const Playlists = () => {
	const insets = useSafeAreaInsets();
	const [favorited, setFavorited] = React.useState([]);
	const [playlists, setPlaylists] = React.useState([]);
	const [config, setConfig] = React.useState({});

	const getFavorited = () => {
		fetch(config.url + '/rest/getStarred?' + config.query)
			.then((response) => response.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setFavorited(json['subsonic-response'].starred.song)
				} else {
					console.log('getStarred:', json['subsonic-response']?.error)
				}
			})
	}

	const getPlaylists = () => {
		fetch(config.url + '/rest/getPlaylists?' + config.query)
			.then((response) => response.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setPlaylists(json['subsonic-response'].playlists.playlist)
				} else {
					console.log('getPlaylists:', json['subsonic-response']?.error)
				}
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
				contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
			>
				<Text style={{ color: theme.primaryLight, fontSize: 30, fontWeight: 'bold', marginBottom: 20, marginTop: 30, marginStart: 20 }}>Your Playlists</Text>
				<View style={styles.subTitleParent}>
					<Text style={styles.subTitle}><Icon name="heart" size={23} color={theme.primaryTouch} /> Favorited</Text>
					<Text style={{ color: theme.secondaryLight, fontWeight: 'bold', fontSize: 15 }}>{favorited?.length} <Icon name="chevron-right" size={15} color={theme.secondaryLight} /></Text>
				</View>
				<SongsList songs={favorited?.slice(0, 3)} config={config} />
				<View style={styles.subTitleParent}>
					<Text style={styles.subTitle}><Icon name="heart" size={23} color={theme.primaryTouch} /> Playlists</Text>
				</View>
				<VerticalPlaylist playlists={playlists} config={config} />
			</ScrollView>
		</View>
	)
}

const styles = {
	subTitleParent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingRight: 10,
		marginTop: 20,
		marginBottom: 20,
		marginStart: 20,
	},
	subTitle: {
		color: theme.primaryLight,
		fontSize: 22,
		fontWeight: 'bold',
	}
}

export default Playlists;