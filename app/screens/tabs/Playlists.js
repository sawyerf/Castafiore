import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../../utils/theme';
import { getConfig } from '../../utils/config';
import SongsList from '../../components/SongsList';
import VerticalPlaylist from '../../components/VerticalPlaylist';
import mainStyles from '../../styles/main';


const Playlists = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const [favorited, setFavorited] = React.useState([]);
	const [playlists, setPlaylists] = React.useState([]);
	const [config, setConfig] = React.useState({});

	const [refreshing, setRefreshing] = React.useState(false);

	const onRefresh = () => {
		if (refreshing) return;
		setRefreshing(true);
		getFavorited()
		getPlaylists()
	};

	const getFavorited = () => {
		fetch(`${config.url}/rest/getStarred?${config.query}`)
			.then((response) => response.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setFavorited(json['subsonic-response'].starred.song)
				} else {
					console.log('getStarred:', json['subsonic-response']?.error)
				}
				setRefreshing(false);
			})
	}

	const getPlaylists = () => {
		fetch(`${config.url}/rest/getPlaylists?${config.query}`)
			.then((response) => response.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setPlaylists(json['subsonic-response'].playlists.playlist)
				} else {
					console.log('getPlaylists:', json['subsonic-response']?.error)
				}
				setRefreshing(false);
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
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets),
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
			refreshControl={(Platform.OS === 'ios' || Platform.OS === 'android') ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryLight} /> : null}
		>
			<Text style={mainStyles.mainTitle}>Your Playlists</Text>
			<TouchableOpacity style={styles.subTitleParent} onPress={() => navigation.navigate('Favorited', { favorited })}>
				<Text style={mainStyles.subTitle}><Icon name="heart" size={23} color={theme.primaryTouch} /> Favorited</Text>
				<Text style={{ color: theme.secondaryLight, fontWeight: 'bold', fontSize: 15 }}>
					{favorited?.length} <Icon name="chevron-right" size={15} color={theme.secondaryLight} />
				</Text>
			</TouchableOpacity>
			<SongsList songs={favorited?.slice(0, 3)} config={config} />
			<View style={styles.subTitleParent}>
				<Text style={mainStyles.subTitle}><Icon name="heart" size={23} color={theme.primaryTouch} /> Playlists</Text>
			</View>
			<VerticalPlaylist playlists={playlists} config={config} />
		</ScrollView>
	)
}

const styles = {
	subTitleParent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 20,
		...mainStyles.stdVerticalMargin
	},
}

export default Playlists;