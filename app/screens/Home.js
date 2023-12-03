import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import HorizontalAlbumList from '../components/HorizontalAlbumList';
import PlayerBox from '../components/PlayerBox';
import { playSong } from '../utils/playSong';

const Home = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const [config, setConfig] = React.useState({});

	const clickRandomSong = async () => {
		console.log('clickRandomSong')
		fetch(config.url + '/rest/getRandomSongs?' + config.query)
			.then((response) => response.json())
			.then((json) => {
				console.log(json)
				const song = json['subsonic-response'].randomSongs.song[0]
				playSong(config.url + '/rest/download?id=' + song.id + '&' + config.query)
			})
	}

	React.useEffect(() => {
		getConfig()
			.then((config) => {
				setConfig(config)
			})
	}, [])

	return (
		<View style={{ flex: 1 }}>
			<ScrollView vertical={true}
				style={{
					flex: 1,
					backgroundColor: theme.primaryDark,
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
				contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
				<View style={styles.boxRandom} onTouchEnd={clickRandomSong}>
					<Text style={styles.textRandom}>Random Song from</Text>
					<Text style={styles.textRandom}>My Music</Text>
				</View>
				{config?.url && <HorizontalAlbumList config={config} title={'Recently Added'} type={'newest'} />}
				{config?.url && <HorizontalAlbumList config={config} title={'Most Played'} type={'frequent'} />}
				{config?.url && <HorizontalAlbumList config={config} title={'Recently Played'} type={'recent'} />}
			</ScrollView>
			<PlayerBox />
		</View>
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