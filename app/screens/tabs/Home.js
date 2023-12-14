import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HorizontalAlbumList from '../../components/HorizontalAlbumList';
import mainStyles from '../../styles/main';
import theme from '../../utils/theme';
import { SoundContext, playSong } from '../../utils/playSong';
import { getConfig } from '../../utils/config';

const Home = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const sound = React.useContext(SoundContext)
	const [config, setConfig] = React.useState({});

	const [refreshing, setRefreshing] = React.useState(false);

	const onRefresh = () => {
		if (refreshing) return;
		setRefreshing(true);
		setConfig({ ...config, refresh: Math.random() })
		setTimeout(() => {
			setRefreshing(false);
		}, 1000)
	};

	const clickRandomSong = () => {
		fetch(`${config.url}/rest/getRandomSongs?${config.query}`)
			.then((response) => response.json())
			.then((json) => {
				const song = json['subsonic-response'].randomSongs.song[0]
				playSong(sound, `${config.url}/rest/download?id=${song.id}&${config.query}`)
			})
	}

	React.useEffect(() => {
		getConfig()
			.then((config) => {
				setConfig(config)
			})
	}, [])

	return (
		<ScrollView vertical={true}
			style={mainStyles.mainContainer(insets)}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryLight} />}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<View style={styles.boxRandom} onTouchEnd={clickRandomSong}>
				<Text style={styles.textRandom}>Random Song from</Text>
				<Text style={styles.textRandom}>My Music</Text>
			</View>
			{config?.url && <HorizontalAlbumList config={config} title={'Recently Added'} type={'newest'} />}
			{config?.url && <HorizontalAlbumList config={config} title={'Most Played'} type={'frequent'} />}
			{config?.url && <HorizontalAlbumList config={config} title={'Recently Played'} type={'recent'} />}
		</ScrollView>
	);
}

const styles = {
	boxRandom: {
		backgroundColor: theme.primaryTouch,
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
		margin: 20,
		borderRadius: 10,
	},
	textRandom: {
		fontSize: 20,
		color: theme.primaryLight,
		fontWeight: 'bold',
	}
}

export default Home;